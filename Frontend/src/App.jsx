import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Layout, Card, Input, Button, Typography, Space, message, Spin, Progress, Slider, Upload, Row, Col, List, Tooltip, Collapse, Form } from 'antd';
import { CloudUploadOutlined, SendOutlined, DownloadOutlined, InfoCircleOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import './App.css';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const API_URL = 'http://localhost:8000';

function App() {
  const [input, setInput] = useState('');
  const [structuredInput, setStructuredInput] = useState({
    genre: '',
    mood: '',
    tempo: '',
    instruments: '',
    segment: ''
  });
  const [duration, setDuration] = useState(30);
  const [repeatCount, setRepeatCount] = useState(1);
  const [melodyFile, setMelodyFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState(null);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [playingStates, setPlayingStates] = useState({});
  const [audioDurations, setAudioDurations] = useState({});
  const audioRefs = useRef({});

  useEffect(() => {
    if (taskId) {
      const interval = setInterval(checkTaskStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [taskId]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleUpload = (info) => {
    const { status } = info.file;
    if (status === 'done') {
      setMelodyFile(info.file.originFileObj);
      message.success(`${info.file.name} 파일이 성공적으로 업로드되었습니다.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} 파일 업로드에 실패했습니다.`);
    }
  };
  
  const handleGenerateMusic = async () => {
    if (!input.trim() && !melodyFile && !Object.values(structuredInput).some(v => v.trim())) {
      message.error('음악 설명을 입력하거나 멜로디 파일을 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setGeneratedFiles([]);

    const formData = new FormData();
    formData.append('free_input', input.trim() || '멜로디 파일 기반 음악 생성');
    formData.append('duration', duration.toString());
    formData.append('repeat_count', repeatCount.toString());
    
    if (Object.values(structuredInput).some(value => value.trim() !== '')) {
      formData.append('structured_input', JSON.stringify(structuredInput));
    }

    if (melodyFile) {
      formData.append('melody_file', melodyFile);
    }

    try {
      const response = await axios.post(`${API_URL}/api/generate-music`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      });
      setTaskId(response.data.task_id);
    } catch (error) {
      console.error('음악 생성 중 오류:', error);
      if (error.response && error.response.status === 422) {
        message.error(`입력 오류: ${error.response.data.detail}`);
      } else {
        message.error('음악 생성을 시작하지 못했습니다. 다시 시도해 주세요.');
      }
      setIsLoading(false);
    }
  };
  
  const checkTaskStatus = async () => {
    if (!taskId) return;

    try {
      const response = await axios.get(`${API_URL}/api/task/${taskId}`);
      const { status, message: statusMessage, progress, files } = response.data;

      setProgress(progress);
  
      if (status === 'completed') {
        setGeneratedFiles(files);
        setIsLoading(false);
        setTaskId(null);
        message.success('음악이 성공적으로 생성되었습니다!');
      } else if (status === 'failed') {
        setIsLoading(false);
        setTaskId(null);
        message.error(`음악 생성 실패: ${statusMessage}`);
      }
    } catch (error) {
      console.error('작업 상태 확인 중 오류:', error);
      message.error('작업 상태를 확인하지 못했습니다');
    }
  };

  const handleDownload = (fileName) => {
    const link = document.createElement('a');
    link.href = `${API_URL}/api/download/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStructuredInputChange = (field, value) => {
    setStructuredInput(prev => ({ ...prev, [field]: value }));
  };

  const handleStreamAudio = async (taskId) => {
    try {
      const response = await axios.get(`${API_URL}/api/stream/${taskId}`, {
        responseType: 'blob'
      });
      
      const audioBlob = new Blob([response.data], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.play();

      setPlayingStates(prev => ({ ...prev, [taskId]: true }));
      
      audio.onended = () => {
        setPlayingStates(prev => ({ ...prev, [taskId]: false }));
      };

      audioRefs.current[taskId] = audio;
    } catch (error) {
      console.error('음악 스트리밍 중 오류:', error);
      message.error('음악 스트리밍을 시작하지 못했습니다. 다시 시도해 주세요.');
    }
  };

  const handlePlayPause = (taskId) => {
    const audio = audioRefs.current[taskId];
    if (audio) {
      if (playingStates[taskId]) {
        audio.pause();
      } else {
        audio.play();
      }
      setPlayingStates(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    } else {
      handleStreamAudio(taskId);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a237e 0%, #0097a7 100%)' }}>
      <Content style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Card 
          bordered={false} 
          style={{ 
            flex: 1,
            width: '100%',
            borderRadius: 16, 
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            background: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '20px',
            overflow: 'auto'
          }}
        >
          <Title level={1} style={{ marginBottom: 30, textAlign: 'center', color: '#1a237e' }}>
            StreamSonic: AI Composer for Live Creativity
          </Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <TextArea
              placeholder="원하는 음악을 자유롭게 설명해주세요. (예: RPG게임 스트리밍용 배경음악)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ borderRadius: 8, border: '1px solid #d9d9d9', minHeight: 100, fontSize: '16px' }}
            />
            
            <Collapse
              bordered={false}
              style={{ background: 'transparent' }}
            >
              <Panel 
                header={
                  <span>
                    <InfoCircleOutlined style={{ marginRight: 8 }} />
                    고급 옵션
                  </span>
                } 
                key="1"
              >
                <Form layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="장르">
                        <Input 
                          placeholder="예: EDM, 힙합, 재즈, 발라드" 
                          value={structuredInput.genre}
                          onChange={(e) => handleStructuredInputChange('genre', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="분위기">
                        <Input 
                          placeholder="예: 활기찬, 차분한, 긴장감 있는" 
                          value={structuredInput.mood}
                          onChange={(e) => handleStructuredInputChange('mood', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="템포">
                        <Input 
                          placeholder="예: 빠른, 중간, 느린" 
                          value={structuredInput.tempo}
                          onChange={(e) => handleStructuredInputChange('tempo', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="주요 악기">
                        <Input 
                          placeholder="예: 기타, 신디사이저, 드럼" 
                          value={structuredInput.instruments}
                          onChange={(e) => handleStructuredInputChange('instruments', e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="스트림 세그먼트">
                    <Input 
                      placeholder="예: 인트로, 아웃트로, 게임 플레이 중" 
                      value={structuredInput.segment}
                      onChange={(e) => handleStructuredInputChange('segment', e.target.value)}
                    />
                  </Form.Item>
                </Form>
              </Panel>
            </Collapse>

            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} sm={12} lg={6}>
                <Text strong style={{ fontSize: '16px' }}>음악 길이: {duration}초</Text>
                <Slider
                  min={1}
                  max={30}
                  value={duration}
                  onChange={setDuration}
                  tooltip={{ formatter: (value) => `${value}초` }}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Text strong style={{ fontSize: '16px' }}>반복 횟수: {repeatCount}</Text>
                <Slider
                  min={1}
                  max={10}
                  value={repeatCount}
                  onChange={setRepeatCount}
                  tooltip={{ formatter: (value) => `${value}회` }}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Upload
                  accept=".wav,.mp3"
                  beforeUpload={(file) => {
                    setMelodyFile(file);
                    return false;
                  }}
                  onChange={handleUpload}
                  fileList={melodyFile ? [melodyFile] : []}
                >
                  <Button icon={<CloudUploadOutlined />} style={{ width: '100%', fontSize: '16px' }}>멜로디 업로드 (선택사항)</Button>
                </Upload>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleGenerateMusic}
                  disabled={isLoading}
                  size="large"
                  style={{ width: '100%', height: 40, borderRadius: 8, background: '#1a237e', borderColor: '#1a237e', fontSize: '16px' }}
                >
                  음악 생성하기
                </Button>
              </Col>
            </Row>
          </Space>

          {isLoading && (
            <Card style={{ marginTop: '20px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.9)' }}>
              <Spin spinning={isLoading} tip="음악을 생성 중입니다...">
                <Progress percent={progress} status="active" strokeColor={{ from: '#108ee9', to: '#87d068' }} />
                <Paragraph style={{ fontSize: '16px', marginTop: '20px' }}>
                  <InfoCircleOutlined style={{ marginRight: '8px' }} />
                  AI가 당신의 스트리밍을 위한 맞춤형 음악을 만들고 있습니다... {progress}% 완료
                </Paragraph>
                <Tooltip title="AI는 여러분의 입력을 분석하고, 음악 이론을 적용하여 독특한 멜로디와 화음을 만들어내고 있습니다.">
                  <Paragraph style={{ fontSize: '14px', color: '#666' }}>
                    현재 진행 중: {getProgressStage(progress)}
                  </Paragraph>
                </Tooltip>
              </Spin>
            </Card>
          )}

          {!isLoading && generatedFiles.length > 0 && (
            <Card 
              title={<Title level={3} style={{ color: '#1a237e' }}>생성된 음악</Title>} 
              style={{ marginTop: '20px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.9)' }}
            >
              <List
                itemLayout="vertical"
                dataSource={generatedFiles}
                renderItem={(file, index) => (
                  <List.Item
                    key={index}
                    actions={[
                      <Button 
                        icon={<DownloadOutlined />} 
                        onClick={() => handleDownload(file.wav_file_name)} 
                        size="large"
                      >
                        WAV 다운로드
                      </Button>
                    ]}
                    extra={
                      <Space direction="vertical" align="end">
                        <Button
                          type="primary"
                          shape="circle"
                          icon={playingStates[file.wav_file_name] ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                          onClick={() => handlePlayPause(file.wav_file_name)}
                          size="large"
                        />
                        <Text>{formatTime(audioDurations[file.wav_file_name] || 0)}</Text>
                      </Space>
                    }
                  >
                    <List.Item.Meta
                      title={<Text strong style={{ fontSize: '18px' }}>{`생성된 음악 ${index + 1}`}</Text>}
                      description={<Paragraph style={{ fontSize: '16px' }}>{file.optimized_prompt}</Paragraph>}
                    />
                    <audio
                      ref={(el) => audioRefs.current[file.wav_file_name] = el}
                      src={`${API_URL}${file.wav_file_url}`}
                      onLoadedMetadata={(e) => {
                        setAudioDurations(prev => ({
                          ...prev,
                          [file.wav_file_name]: e.target.duration
                        }));
                      }}
                      onEnded={() => setPlayingStates(prev => ({ ...prev, [file.wav_file_name]: false }))}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Card>
      </Content>   
    </Layout>
  );
}

function getProgressStage(progress) {
  if (progress < 25) {
    return "입력 분석 및 음악 스타일 결정";
  } else if (progress < 50) {
    return "멜로디 생성";
  } else if (progress < 75) {
    return "화성 및 리듬 구성";
  } else {
    return "최종 음악 편집 및 마무리";
  }
}

export default App;