import React from 'react'
import './App.css'

interface Doc {
  title: string
  url: string
}

interface Resume extends Doc {
}

const resumes: Resume[] = [
  {
    title: '个人简历-2023',
    url: '/resume-2023.pdf',
  },
  {
    title: '个人简历-2024',
    url: '/resume-2024.pdf',
  },
]

const docs: Doc[] = [
  {
    title: 'Retrofit 源码解析.md',
    url: 'https://github.com/xaluoqone/xaluoqone.com/blob/dev/public/docs/http/Retrofit%20%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90.md',
  },
]

function App() {
  return (
    <div className={'root'}>
      <div className={'content'} style={{ flexDirection: 'column' }}>
        <h3>Welcome to xaluoqone.com</h3>
        <ul><h5>简历列表</h5>{
          resumes.map(resume => (
            <li>
              <a href={resume.url} target={'_blank'} rel={'noreferrer'}>{resume.title}</a>
            </li>
          ))
        }</ul>
        <ul><h5>小记</h5>{
          docs.map(doc => (
            <li>
              <a href={doc.url} target={'_blank'} rel={'noreferrer'}>{doc.title}</a>
            </li>
          ))
        }</ul>
      </div>
      <div className={'footer'}>
        <a href="https://beian.miit.gov.cn">赣ICP备2021006394号</a>
      </div>
    </div>
  )
}

export default App
