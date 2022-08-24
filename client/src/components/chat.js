import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';

import updateIcon from '../images/update-icon.svg';
import logOutIcon from '../images/logout-svgrepo-com.svg';
import returnBackIcon from '../images/return-back.svg';
import { green } from '@mui/material/colors';
import Icon from '@mui/material/Icon';
// const BASE_URL = 'https://whatsapp-widget.herokuapp.com/';
// const BASE_URL = 'http://localhost:8001/';

export function Chat({ clientId, chatWindow }) {
  const [client, setClient] = useState('loading');
  const [number, setNumber] = useState(0);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const messageEl = useRef(null);
  const [openChat, setOpenChat] = useState(chatWindow);
  const [contactList, setContactList] = useState(true);

  let navigate = useNavigate();
  console.log(clientId);
  console.log(chatWindow);

  const hiddenFileInput = useRef(null);

  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  useEffect(() => {
    // console.log(chatWindow);
    if (!chatWindow) {
      getChats();
    }
    setOpenChat(chatWindow);
    if (client === 'loading') {
      getCLient();
    }

    if (client) {
      if (typeof openChat === 'string') {
        setNumber(chatWindow);
        const chatId = `${chatWindow}@c.us`;
        console.log('sup', chatId);
        getMessages(chatId);
      }
      getChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatWindow, client, openChat]);

  const getCLient = async () => {
    const client = await axios.get(`/api/getClient?client=${clientId}`);
    console.log(client);
    if (client.data.err === 'undefined not found!') {
      logOut();
    }
    return setClient(client.data);
  };

  const postMessage = async e => {
    e.preventDefault();
    setMessage('');
    setTimeout(() => {
      getMessages(`${number}@c.us`);
    }, 1200);
    const send = await axios.get(
      `/api/sendmessage?client=${clientId}&number=${number}&message=${message}`
    );
    return send.data;
  };

  const getChats = async () => {
    const chats = await axios.get(`/api/getChats?client=${clientId}`);
    console.log(chatWindow);
    if (chats.data.err === 'server error') {
      logOut();
    }
    // console.log(chats.data.err);
    return setChats(chats.data);
  };

  const getMessages = async chatId => {
    // console.log(chatId);
    const messages = await axios.get(`/api/getmessages?client=${clientId}&chatId=${chatId}`);
    return setChatHistory(messages.data);
  };

  const handleFile = async event => {
    const fileUploaded = event.target.files[0];
    console.log('fileUploaded', fileUploaded);
    const name = fileUploaded.name;

    console.log(name);

    const send = await axios.get(
      `/api/sendmedia?client=${clientId}&number=${number}&message=${fileUploaded}`
    );
    console.log('handleFile', send);
    return send.data;
  };
  const logOut = async () => {
    // setShow(false);
    // setClientInfo(false);
    await axios.get(`/api/logout?client=${clientId}`);
    localStorage.removeItem('clientInfo');
    navigate('/');
  };

  const onReturnBtn = () => {
    setContactList(true);
    setClient('loading');
  };
  return (
    <div className='flex py-[30px]'>
      <div className='flex flex-col space-y-4 px-8 pb-8 pt-2 h-[auto] bg-gray-100 rounded-lg border'>
        <div className='flex items-center justify-between border-b py-4 w-50'>
          {!chatWindow && contactList && <p className='font-bold text-2xl'>Names</p>}
          {!contactList && <p className='font-bold text-2xl'>Chats</p>}

          <div className='flex space-x-2'>
            <button
              onClick={() => getChats()}
              className='cursor-pointer hover:bg-gray-50 flex justify-center items-center w-10 h-10 bg-white rounded-lg border'>
              <img src={updateIcon} alt='update icon' className='w-6 ' />
            </button>
            <button
              onClick={() => logOut()}
              className='cursor-pointer hover:bg-gray-50 flex justify-center items-center w-10 h-10 bg-white rounded-lg border'>
              <img src={logOutIcon} alt='log out icon' className='w-6 ' />
            </button>
          </div>
        </div>
        <div className='flex'>
          {!chatWindow && contactList && (
            <div className='flex flex-col space-y-4'>
              <div className='flex flex-col space-y-1 overflow-y-auto h-[65vh]'>
                {chats.length > 0 && (
                  <ul>
                    {chats.map(chat => (
                      <li
                        key={chat?.id?.user}
                        onClick={() => {
                          console.log(chat);
                          setCurrentChat(chat.id._serialized);
                          setNumber(chat.id.user);
                          getMessages(chat.id._serialized);
                          setContactList(false);
                        }}
                        className={`${
                          currentChat === chat.id._serialized && 'bg-green-300'
                        } cursor-pointer hover:bg-green-50 border rounded-lg px-2 py-1 my-3`}>
                        {chat.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {!contactList && (
          <div className='flex items-center justify-between border-b'>
            <div className='flex flex-col space-y-2'>
              <button
                onClick={onReturnBtn}
                className='cursor-pointer hover:bg-gray-50 flex justify-center items-center w-10 h-10 bg-white rounded-lg border'>
                <img src={returnBackIcon} alt='log out icon' className='w-6 ' />
              </button>
              <div
                ref={messageEl}
                className='flex flex-col space-y-2 overflow-y-auto w-[280px] h-[55vh] border rounded-lg p-4 bg-gray-50'>
                {chatHistory.length > 0 &&
                  chatHistory.map(msg => {
                    const timestamp = Date.now();
                    const date = new Intl.DateTimeFormat('ru-RU', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(timestamp);
                    if (msg.fromMe === true) {
                      return (
                        <div className='bg-gray-100 text-sm self-end px-3 py-2 border rounded-lg '>
                          {msg.body}
                          <p className='mt-1 text-xs text-gray-400 text-end'>{date}</p>
                        </div>
                      );
                    } else {
                      return (
                        <div className='bg-white text-sm self-start px-3 py-2 border rounded-lg'>
                          {msg.body}
                          <p className='mt-1 text-xs text-gray-400 text-end'>{date}</p>
                        </div>
                      );
                    }
                  })}
              </div>
              <form onSubmit={e => postMessage(e)} className='flex relative items-center'>
                <div>
                  <button className='absolute top-1 left-1' onClick={handleClick}>
                    <Icon sx={{ color: green[500] }}>add_circle</Icon>
                  </button>
                  <input
                    type='file'
                    ref={hiddenFileInput}
                    onChange={handleFile}
                    style={{ display: 'none' }}
                  />
                </div>

                <input
                  placeholder='Type some message ..'
                  onChange={e => setMessage(e.target.value)}
                  value={message}
                  className='pl-7 w-full h-8 border-2 border-green-200 rounded-lg'
                  type='text'
                />

                <Button
                  size='small'
                  type='sumbit'
                  sx={{ minWidth: 40, marginLeft: 1 }}
                  variant='contained'
                  endIcon={<SendIcon />}></Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
