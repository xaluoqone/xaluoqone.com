import React from 'react'
import './App.css'
import { useMount, useReactive } from 'ahooks'

interface Doc {
  name: string
  url: string
}

interface Resume extends Doc {
  id: number
}

const docs: Doc[] = [
  {
    name: 'Retrofit 源码解析.md',
    url: 'https://github.com/xaluoqone/xaluoqone.com/blob/dev/public/docs/http/Retrofit%20%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90.md',
  },
]

const BASE_URL = 'https://api.xaluoqone.com'

// const BASE_URL = 'http://localhost:8081'

function App() {
  const state = useReactive({
    resumes: [] as Resume[],
    file: undefined as File | undefined,
  })

  useMount(() => {
    console.log('获取resumes')
    fetch(`${BASE_URL}/resume/all`, { method: 'GET' })
      .then(async response => {
        if (response.ok) {
          state.resumes = await response.json()
        } else {
          console.error('获取简历列表失败')
        }
      })
      .catch(error => console.error('Error:', error))
  })

  return (
    <div className={'root'}>
      <div className={'content'} style={{ flexDirection: 'column' }}>
        <h3>Welcome to xaluoqone.com</h3>
        <ul><h4>简历列表</h4>{
          state.resumes.map(resume => (
            <li key={resume.id}>
              <a href={resume.url} target={'_blank'} rel={'noreferrer'}>{resume.name}</a>
            </li>
          ))
        }</ul>
        <ul><h4>小记</h4>{
          docs.map(doc => (
            <li key={doc.url}>
              <a href={doc.url} target={'_blank'} rel={'noreferrer'}>{doc.name}</a>
            </li>
          ))
        }</ul>
        {/*<form*/}
        {/*  onSubmit={(event: FormEvent<HTMLFormElement>) => {*/}
        {/*    event.preventDefault()*/}
        {/*    if (!state.file) return*/}
        {/*    const formData = new FormData()*/}
        {/*    formData.append('file', state.file)*/}
        {/*    fetch(`${BASE_URL}/resume/upload`, { method: 'POST', body: formData })*/}
        {/*      .then(async response => {*/}
        {/*        if (response.ok) {*/}
        {/*          const resume = await response.json()*/}
        {/*          state.resumes.push(resume)*/}
        {/*          console.log('File uploaded successfully')*/}
        {/*        } else {*/}
        {/*          console.error('File upload failed')*/}
        {/*        }*/}
        {/*      })*/}
        {/*      .catch(error => console.error('Error:', error))*/}
        {/*  }}>*/}
        {/*  <input*/}
        {/*    type="file"*/}
        {/*    name="file"*/}
        {/*    onChange={(event: ChangeEvent<HTMLInputElement>) => {*/}
        {/*      if (event.target.files && event.target.files.length > 0) {*/}
        {/*        state.file = event.target.files[0]*/}
        {/*      }*/}
        {/*    }}/>*/}
        {/*  <button type="submit">Upload</button>*/}
        {/*</form>*/}
      </div>
      <div className={'footer'}>
        <a href="https://beian.miit.gov.cn">赣ICP备2021006394号</a>
      </div>
    </div>
  )
}

export default App
