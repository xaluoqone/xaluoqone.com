import React from 'react'
import './App.css'

interface Resume {
  title: string
  url: string
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

function App() {
  return (
    <div className={'root'}>
      <div className={'content'} style={{ flexDirection: 'column' }}>
        <h3>Welcome to xaluoqone.com</h3>
        <ul>{
          resumes.map(resume => (
            <li>
              <a href={resume.url} target={'_blank'} rel={'noreferrer'}>{resume.title}</a>
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
