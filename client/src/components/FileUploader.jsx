import React from 'react';
// import uploadFile from '../images/upload-file.svg';
import { green } from '@mui/material/colors';
import Icon from '@mui/material/Icon';

const FileUploader = props => {
  const hiddenFileInput = React.useRef(null);

  const handleClick = event => {
    hiddenFileInput.current.click();
  };
  const handleChange = event => {
    const fileUploaded = event.target.files[0];
    console.log(fileUploaded);
    props.handleFile(fileUploaded.name);
  };
  return (
    <>
      <button className='absolute top-1 left-1' onClick={handleClick}>
        <Icon sx={{ color: green[500] }}>add_circle</Icon>
        {/* <img className='w-6' src={uploadFile} alt='upload file' /> */}
      </button>
      <input
        type='file'
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  );
};
export default FileUploader;
