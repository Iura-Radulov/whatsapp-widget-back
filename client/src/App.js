import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Chat from './components/chat';
import Settings from './components/settings';

export function App({ chat, clientid, show }) {
  // console.log(chat);

  if (show === 'show' && clientid) {
    return (
      <div className='whatsappwidget'>
        <div className='flex flex-col justify-center items-center'>
          <Router>
            <Routes>
              <Route exact path='/' element={<Settings chatWindow={chat} clientId={clientid} />} />
              <Route path='/chat' element={<Chat chatWindow={chat} clientId={clientid} />} />
            </Routes>
          </Router>
        </div>
      </div>
    );
  } else return <div className='whatsappwidget'></div>;
}

export default App;
