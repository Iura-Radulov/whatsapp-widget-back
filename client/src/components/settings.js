import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import svgSettings from '../images/svgSettings';
import EnterInstraction from './EnterInstaction';
import updateIcon from '../images/update-icon.svg';
import enterIcon from '../images/enterIcon.svg';
// const BASE_URL = 'https://whatsapp-widget.herokuapp.com/';

// const BASE_URL = 'http://localhost:8001/';

export default function Settings({ clientId }) {
  const [qr, setQr] = useState(0);
  const [update, setUpdate] = useState(false);
  const [clientInfo, setClientInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  let navigate = useNavigate();

  console.log('clientInfo', clientInfo);

  useEffect(() => {
    getCLientInfo();

    console.log('qr-effect', qr);
    console.log('clientId', clientId);
    if (qr) {
      console.log('clientInfo', clientInfo);
      setLoading(false);
      getCLientInfo();
    }
    if (clientInfo) {
      navigate(`/chat`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientInfo, qr]);

  if (qr && !update) {
    setTimeout(() => setUpdate(true), 40000);
  }

  if (qr && !update) {
    setTimeout(() => setUpdate(true), 40000);
  }

  useEffect(() => {
    const enter = async () => {
      setLoading(true);
      const qr = await axios.get(`/api/createClient?client=${clientId}`);

      if (qr.data.qr) {
        return setQr(qr.data.qr);
      }
    };
    enter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCLientInfo = async () => {
    console.log('SEARCHING', clientId);
    const clientInfo = await axios.get(`/api/getClient?client=${clientId}`);
    console.log('getclientInfo', clientInfo.data);
    if (clientInfo.data.err === 'undefined not found!') {
      return;
    }
    if (clientInfo.data.me) {
      return setClientInfo(clientInfo.data);
    }
  };

  const onUpdate = async () => {
    setLoading(true);
    getCLientInfo();
    if (clientInfo) {
      return;
    }
    const qr = await axios.get(`api/createClient?client=${clientId}`);
    setUpdate(false);

    if (qr.data.qr) {
      return setQr(qr.data.qr);
    }
  };

  const logIn = async () => {
    setLoading(true);
    const qr = await axios.get(`/api/createClient?client=${clientId}`);

    if (qr.data.qr) {
      return setQr(qr.data.qr);
    }
  };

  return (
    <div className='flex justify-center items-center w-full h-screen'>
      <div className='flex items-center flex-col w-96 min-h-96 py-4 rounded-lg border bg-gray-50'>
        <h1 className='my-4 font-bold text-4xl'>WhatsApp Client</h1>
        <div className='flex flex-col items-center'>
          <EnterInstraction />
          <QRCodeSVG value={qr} className='my-[30px]' />
          <div className='flex'>
            {update && (
              <button
                onClick={() => onUpdate()}
                className='flex items-center space-x-2 mr-3 px-3 py-1 mb-3 bg-green-400 font-bold rounded-lg hover:bg-green-200'>
                {loading && svgSettings}
                {!loading && <img src={updateIcon} alt='update icon' className='w-6' />}
              </button>
            )}

            {qr ? (
              <button
                onClick={() => getCLientInfo()}
                className='flex items-center space-x-2 px-2 py-1 bg-green-400 font-bold rounded-lg hover:bg-green-200'>
                <img src={enterIcon} alt='enter icon' className='w-6' />
              </button>
            ) : (
              <button
                onClick={() => logIn()}
                className='flex items-center space-x-2 px-3 py-1 bg-green-400 font-bold rounded-lg hover:bg-green-200'>
                {loading && svgSettings}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
