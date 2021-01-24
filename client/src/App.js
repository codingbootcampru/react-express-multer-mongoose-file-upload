import React, { useState } from 'react'
import axios from 'axios'
import './App.css';

function App() {

  const [selectedFile, setSelectedFile] = useState(null)

  const fileSelectedHandler = event => {
    console.log(event.target.files[0]);
    setSelectedFile(event.target.files[0])
  }

  const fileUploadHandler = () => {
    const fd = new FormData()
    fd.append('image', selectedFile, selectedFile.name)
    axios.post('http://localhost:4000/api/uploads', fd, {
      onUploadProgress: progressEvent => {
        console.log('Upload Progress: ' + Math.round(progressEvent.loaded / progressEvent.total * 100) + '%');
      }
    })
      .then(res => {
        console.log(res);
      })
  }

  return (
    <div className="App">
      <input
        // style={{ display: 'none' }}
        type='file'
        name='image'
        onChange={fileSelectedHandler}
      // ref={fileInput => this.fileInput = fileInput} 
      />
      {/* <button onClick={() => this.fileInput.click()}>Pick file</button> */}
      <button onClick={fileUploadHandler}>Upload</button>
    </div>
  );
}

export default App;
