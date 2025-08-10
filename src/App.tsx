import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import './App.css';

// API endpoint
const API_BASE_URL = 'https://api.215123.cn';

// Utility function to handle requests
const request = async (url: string, satoken: string) => {
  console.log(`Making request to: ${API_BASE_URL}${url}`);
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers: {
      'satoken': satoken,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log(`Response data for ${url}:`, data); // Log the response data
  return data;
};

const App: React.FC = () => {
  // States for OpenId, SATOKEN, QR code URL, and scale factor
  const [openId, setOpenId] = useState<string>('');
  const [satoken, setSatoken] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [scaleFactor, setScaleFactor] = useState<number>(1.0);
  const [tips, setTips] = useState<string>('等待操作...');

  // Fetch SATOKEN based on OpenId
  const fetchSatoken = useCallback(async (openId: string) => {
    try {
      setTips('正在获取SATOKEN...');
      console.log(`Fetching SATOKEN for OpenId: ${openId}`);
      const data = await request(`/web-app/auth/certificateLogin?openId=${openId}`, '');
      const token = data?.data?.token;

      console.log('Fetched SATOKEN:', token); // Log the fetched token

      if (token && token !== 'null' && token !== '') {
        setSatoken(token);
        localStorage.setItem('satoken', token);
        setTips('SATOKEN获取成功');
      } else {
        throw new Error('无效的OpenId');
      }
    } catch (error) {
      setTips('SATOKEN获取失败');
      console.error('Error fetching SATOKEN:', error);
    }
  }, []);

  // Fetch QR code
  const fetchQRCode = useCallback(async () => {
    if (!satoken) return;

    try {
      setTips('正在更新二维码...');
      console.log('Fetching QR Code with SATOKEN:', satoken);
      const data = await request('/pms/welcome/make-qrcode', satoken);
      const qrCode = data?.data;

      console.log('Fetched QR Code:', qrCode); // Log the fetched QR Code

      if (qrCode && qrCode !== 'null' && qrCode !== '') {
        setQrCodeData(qrCode);
        setTips('二维码更新成功！');
      } else {
        throw new Error('二维码生成失败');
      }
    } catch (error) {
      setTips('二维码更新失败');
      console.error('Error fetching QR Code:', error);
    }
  }, [satoken]);

  // Handle OpenId input
  const handleOpenIdInput = () => {
    const newOpenId = prompt('请输入OpenId：', openId);
    if (newOpenId) {
      setOpenId(newOpenId);
      localStorage.setItem('openId', newOpenId);
      setSatoken(''); // Clear satoken when OpenId changes
      fetchSatoken(newOpenId); // Fetch SATOKEN
    }
  };

  // Handle scale change (zoom in/out for QR code)
  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.4, Math.min(1.0, scaleFactor + delta));
    console.log('Zooming QR Code to scale:', newScale); // Log the new scale factor
    setScaleFactor(newScale);
    localStorage.setItem('scale', newScale.toString());
  };

  // Load stored data from localStorage on component mount
  useEffect(() => {
    const storedOpenId = localStorage.getItem('openId');
    const storedSatoken = localStorage.getItem('satoken');
    const storedScale = localStorage.getItem('scale');
    
    console.log('Stored data:', { storedOpenId, storedSatoken, storedScale });

    if (storedOpenId) setOpenId(storedOpenId);
    if (storedSatoken) setSatoken(storedSatoken);
    if (storedScale) setScaleFactor(parseFloat(storedScale));

    // Fetch SATOKEN and QR code if OpenId is available
    if (storedOpenId && !storedSatoken) {
      fetchSatoken(storedOpenId);
    }
    if (storedSatoken) {
      fetchQRCode();
    }
  }, [fetchSatoken, fetchQRCode]);

  return (
    <div className="App">
      <h1>二维码生成与刷新</h1>

      {/* Input for OpenId */}
      <button onClick={handleOpenIdInput}>设置OpenId</button>
      
      {/* Display tips */}
      <p>{tips}</p>

      {/* QR Code Display */}
      {qrCodeData ? (
        <div
          style={{
            transform: `scale(${scaleFactor})`,
            transition: 'transform 0.3s',
            margin: '20px 0',
          }}
        >
          <QRCode value={qrCodeData} size={200} />
        </div>
      ) : (
        <p>二维码加载中...</p>
      )}

      {/* Zoom In/Out buttons */}
      <div>
        <button onClick={() => handleZoom(0.1)}>放大二维码</button>
        <button onClick={() => handleZoom(-0.1)}>缩小二维码</button>
      </div>

      {/* Refresh QR Code */}
      <button onClick={fetchQRCode}>刷新二维码</button>
    </div>
  );
};

export default App;
