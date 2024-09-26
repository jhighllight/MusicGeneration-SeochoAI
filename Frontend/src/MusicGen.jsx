import React, { useState } from 'react';
import { Input, Button, message } from 'antd';

const MusicGen = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateMusic = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: videoUrl }), // YouTube 링크를 프롬프트로 사용
      });
      const data = await response.json();
      if (response.ok) {
        message.success('음악 생성 요청이 성공적으로 전송되었습니다!');
      } else {
        message.error(data.detail || '음악 생성 요청에 실패했습니다.');
      }
    } catch (error) {
      message.error('서버와의 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>MusicGen AI</h1>
      <Input
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="YouTube 비디오 링크를 입력하세요"
        style={{ width: '300px', marginRight: '10px' }}
      />
      <Button type="primary" onClick={handleGenerateMusic} loading={loading}>
        음악 생성
      </Button>
    </div>
  );
};

export default MusicGen;
