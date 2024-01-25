# Retrofit 源码解析

### Interface 代理创建流程：

首先是 `Retrofit.create` 方法

```kotlin
val api = Retrofit.create(APIInterface::class.java)
```

在 `Retrofit.create` 方法中，使用动态代理方式创建 `APIInterface` 的代理对象

```java
public <T> T create(final Class<T> service) {
    return (T) Proxy.newProxyInstance(service.getClassLoader(), new Class<?>[]{service}, new InvocationHandler() {
        private final Platform platform = Platform.get();
        private final Object[] emptyArgs = new Object[0];

        @Override
        public @Nullable Object invoke(Object proxy, Method method, @Nullable Object[] args) throws Throwable {
          // If the method is a method from Object then defer to normal invocation.
          if (method.getDeclaringClass() == Object.class) {
            return method.invoke(this, args);
          }
          args = args != null ? args : emptyArgs;
          return platform.isDefaultMethod(method)
              ? platform.invokeDefaultMethod(method, service, proxy, args)
              : loadServiceMethod(method).invoke(args);
        }
    });
}
```

`invoke` 方法实现逻辑：
1. 如果 method 声明自 Object（toString、equals等），直接 invoke 这个 method
2. 如果是 interface 的 default 方法，invoke 这个 method
3. 排除掉以上两种情况，那么这个 method 只能是抽象方法

接下来调用 `loadServiceMethod(method).invoke(args)`，首先看 `invoke(args)` 实现：

```java
abstract class ServiceMethod<T> {
    ...

    abstract @Nullable T invoke(Object[] args);
}
```
发现 invoke 是 ServiceMethod<T> 的一个抽象方法，接下来去 loadServiceMethod(method) 找到 loadServiceMethod 返回对象，查看该返回对象的 invoke 实现。
先查看 loadServiceMethod 方法：

```java
ServiceMethod<?> loadServiceMethod(Method method) {
    ServiceMethod<?> result = serviceMethodCache.get(method);
    if (result != null) return result;

    synchronized (serviceMethodCache) {
        result = serviceMethodCache.get(method);
        if (result == null) {
            result = ServiceMethod.parseAnnotations(this, method);
            serviceMethodCache.put(method, result);
        }
    }
    return result;
  }
```

serviceMethodCache 方法实现逻辑：
1. 先去一个 serviceMethodCache 获取这个 method 的缓存（考虑了多线程的情况），如果能拿到，直接返回这个缓存对象
2. 调用 ServiceMethod.parseAnnotations(this, method) 获取 ServiceMethod<?> 对象，并放入 serviceMethodCache 缓存，以便下次调用

由于 serviceMethodCache 并没有找到返回的 ServiceMethod<?> 具体是哪个类的实例
接下来查看 ServiceMethod.parseAnnotations(this, method) 实现：

```java
abstract class ServiceMethod<T> {
    static <T> ServiceMethod<T> parseAnnotations(Retrofit retrofit, Method method) {
        RequestFactory requestFactory = RequestFactory.parseAnnotations(retrofit, method);
        ...
        return HttpServiceMethod.parseAnnotations(retrofit, method, requestFactory);
    }
}
```

ServiceMethod<T>.parseAnnotations 方法也没有找到返回的 ServiceMethod<?> 具体是哪个类的实例
接下来查看 HttpServiceMethod.parseAnnotations(retrofit, method, requestFactory) 实现：

```java
static <ResponseT, ReturnT> HttpServiceMethod<ResponseT, ReturnT> parseAnnotations(Retrofit retrofit, Method method, RequestFactory requestFactory) {
    boolean isKotlinSuspendFunction = requestFactory.isKotlinSuspendFunction;
    boolean continuationWantsResponse = false;
    boolean continuationBodyNullable = false;

    ...

    CallAdapter<ResponseT, ReturnT> callAdapter = createCallAdapter(retrofit, method, adapterType, annotations);
    Type responseType = callAdapter.responseType();

    Converter<ResponseBody, ResponseT> responseConverter = createResponseConverter(retrofit, method, responseType);

    okhttp3.Call.Factory callFactory = retrofit.callFactory;
    if (!isKotlinSuspendFunction) {
        return new CallAdapted<>(requestFactory, callFactory, responseConverter, callAdapter);
    } else if (continuationWantsResponse) {
        //noinspection unchecked Kotlin compiler guarantees ReturnT to be Object.
        return (HttpServiceMethod<ResponseT, ReturnT>)
            new SuspendForResponse<>(requestFactory, callFactory, responseConverter, (CallAdapter<ResponseT, Call<ResponseT>>) callAdapter);
    } else {
        //noinspection unchecked Kotlin compiler guarantees ReturnT to be Object.
        return (HttpServiceMethod<ResponseT, ReturnT>)
              new SuspendForBody<>(requestFactory, callFactory, esponseConverter, (CallAdapter<ResponseT, Call<ResponseT>>)callAdapter, continuationBodyNullable);
    }
  }
```

HttpServiceMethod.parseAnnotations 方法实现逻辑：
1、如果不是 kotlin suspend 方法，返回 CallAdapted 对象
2、否则如果方法返回值是 Response，返回 SuspendForResponse 对象
3、如果以上都不是，返回 SuspendForBody 对象

于是我们查看各自类的实现，发现3个类均继承自 HttpServiceMethod 且没实现 invoke 方法，所以我们查看 HttpServiceMethod 代码

```java
abstract class HttpServiceMethod<ResponseT, ReturnT> extends ServiceMethod<ReturnT> {
    ...

    @Override
    final @Nullable ReturnT invoke(Object[] args) {
        Call<ResponseT> call = new OkHttpCall<>(requestFactory, args, callFactory, responseConverter);
        return adapt(call, args);
    }
    
    protected abstract @Nullable ReturnT adapt(Call<ResponseT> call, Object[] args);

    ...
}
```

可以看到 HttpServiceMethod 继承自 ServiceMethod，实现了 invoke 方法并标记为 final，这意味着这个方法无法再被子类覆写，同时在 invoke 方法中实例了一个 OkHttpCall 对象，然后调用了 adapt 方法，将 OkHttpCall 传入了 adapt，所以接下来查看 adapt 方法。adapt 方法是抽象方法，因此我们需要看 CallAdapted、SuspendForResponse、SuspendForBody 的 adapt 方法实现

首先是 CallAdapted 的 adapt 方法：