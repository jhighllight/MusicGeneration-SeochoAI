// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Layout, Input, Button, Card, Typography, Space, message, Spin, Progress, Slider } from 'antd';
// import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';

// const { Header, Content } = Layout;
// const { Title, Paragraph } = Typography;

// const API_URL = 'http://localhost:8000';

// function App() {
//   const [input, setInput] = useState('');
//   const [duration, setDuration] = useState(10);
//   const [numGenerations, setNumGenerations] = useState(1);
//   const [optimizedPrompt, setOptimizedPrompt] = useState('');
//   const [audioUrl, setAudioUrl] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [taskId, setTaskId] = useState(null);

//   useEffect(() => {
//     let interval;
//     if (taskId) {
//       interval = setInterval(() => {
//         checkTaskStatus(taskId);
//       }, 2000);
//     }
//     return () => clearInterval(interval);
//   }, [taskId]);

//   const handleGenerateMusic = async () => {
//     setIsLoading(true);
//     setProgress(0);
//     setOptimizedPrompt('');
//     setAudioUrl('');

//     try {
//       const response = await axios.post(`${API_URL}/api/generate-music`, {
//         prompt: input,
//         duration: duration,
//         num_generations: numGenerations,
//       });
//       setTaskId(response.data.task_id);
//     } catch (error) {
//       console.error('Error generating music:', error);
//       message.error('Failed to start music generation. Please try again.');
//       setIsLoading(false);
//     }
//   };

//   const checkTaskStatus = async (id) => {
//     try {
//       const response = await axios.get(`${API_URL}/api/task/${id}`);
//       const { status, message: statusMessage, progress, file_url } = response.data;

//       setProgress(progress);

//       if (status === 'completed') {
//         setOptimizedPrompt(statusMessage);
//         setAudioUrl(`${API_URL}${file_url}`);  // 전체 URL 설정
//         setIsLoading(false);
//         setTaskId(null);
//         message.success('Music generated successfully!');
//       } else if (status === 'failed') {
//         setIsLoading(false);
//         setTaskId(null);
//         message.error(`Failed to generate music: ${statusMessage}`);
//       }
//     } catch (error) {
//       console.error('Error checking task status:', error);
//       message.error('Failed to check task status');
//     }
//   };

//   const handleDownload = () => {
//     if (audioUrl) {
//       window.open(audioUrl, '_blank');
//     }
//   };

//   return (
//     <Layout className="layout">
//       <Header className="header">
//         <Title level={3} style={{ color: 'white', margin: 0 }}>AI Music Generator</Title>
//       </Header>
//       <Content className="content">
//         <Space direction="vertical" size="large" style={{ width: '100%' }}>
//           <Card>
//             <Space direction="vertical" size="middle" style={{ width: '100%' }}>
//               <Input.TextArea
//                 placeholder="Describe the music you want to generate..."
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 autoSize={{ minRows: 3, maxRows: 5 }}
//               />
//               <Space>
//                 <span>Duration (seconds):</span>
//                 <Slider
//                   min={5}
//                   max={30}
//                   value={duration}
//                   onChange={setDuration}
//                   style={{ width: 200 }}
//                 />
//                 <span>{duration}s</span>
//               </Space>
//               <Space>
//                 <span>Number of generations:</span>
//                 <Slider
//                   min={1}
//                   max={5}
//                   value={numGenerations}
//                   onChange={setNumGenerations}
//                   style={{ width: 200 }}
//                 />
//                 <span>{numGenerations}</span>
//               </Space>
//               <Button
//                 type="primary"
//                 icon={<SearchOutlined />}
//                 onClick={handleGenerateMusic}
//                 disabled={isLoading || !input.trim()}
//               >
//                 Generate Music
//               </Button>
//             </Space>
//           </Card>

//           {isLoading && (
//             <Card>
//               <Spin spinning={isLoading}>
//                 <Progress percent={progress} status="active" />
//                 <Paragraph>Generating your music... {progress}% complete</Paragraph>
//               </Spin>
//             </Card>
//           )}

//           {optimizedPrompt && (
//             <Card title="Generated Music">
//               <Paragraph>
//                 <strong>Generation Message:</strong> {optimizedPrompt}
//               </Paragraph>
//               {audioUrl && (
//                 <>
//                   <audio controls src={audioUrl} style={{ width: '100%' }} />
//                   <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
//                     Download Music
//                   </Button>
//                 </>
//               )}
//             </Card>
//           )}
//         </Space>
//       </Content>
//     </Layout>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Input, Button, Card, Typography, Space, message, Spin, Progress, Slider } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const API_URL = 'http://localhost:8000';

function App() {
  const [input, setInput] = useState('');  // YouTube 링크를 저장할 상태
  const [duration, setDuration] = useState(10);
  const [numGenerations, setNumGenerations] = useState(1);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState(null);

  useEffect(() => {
    let interval;
    if (taskId) {
      interval = setInterval(() => {
        checkTaskStatus(taskId);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [taskId]);

  const handleGenerateMusic = async () => {
    setIsLoading(true);
    setProgress(0);
    setOptimizedPrompt('');
    setAudioUrl('');

    try {
      const response = await axios.post(`${API_URL}/api/generate-music`, {
        prompt: input,           // YouTube 링크를 프롬프트로 사용
        duration: duration,
        num_generations: numGenerations,
      });
      setTaskId(response.data.task_id);
    } catch (error) {
      console.error('Error generating music:', error);
      message.error('Failed to start music generation. Please try again.');
      setIsLoading(false);
    }
  };

  const checkTaskStatus = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/task/${id}`);
      const { status, message: statusMessage, progress, file_url } = response.data;

      setProgress(progress);

      if (status === 'completed') {
        setOptimizedPrompt(statusMessage);
        setAudioUrl(`${API_URL}${file_url}`);  // 전체 URL 설정
        setIsLoading(false);
        setTaskId(null);
        message.success('Music generated successfully!');
      } else if (status === 'failed') {
        setIsLoading(false);
        setTaskId(null);
        message.error(`Failed to generate music: ${statusMessage}`);
      }
    } catch (error) {
      console.error('Error checking task status:', error);
      message.error('Failed to check task status');
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      window.open(audioUrl, '_blank');
    }
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <Title level={3} style={{ color: 'white', margin: 0 }}>AI Music Generator</Title>
      </Header>
      <Content className="content">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Input.TextArea
                placeholder="YouTube 비디오 링크를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
              <Space>
                <span>Duration (seconds):</span>
                <Slider
                  min={5}
                  max={30}
                  value={duration}
                  onChange={setDuration}
                  style={{ width: 200 }}
                />
                <span>{duration}s</span>
              </Space>
              <Space>
                <span>Number of generations:</span>
                <Slider
                  min={1}
                  max={5}
                  value={numGenerations}
                  onChange={setNumGenerations}
                  style={{ width: 200 }}
                />
                <span>{numGenerations}</span>
              </Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleGenerateMusic}
                disabled={isLoading || !input.trim()}
              >
                Generate Music
              </Button>
            </Space>
          </Card>

          {isLoading && (
            <Card>
              <Spin spinning={isLoading}>
                <Progress percent={progress} status="active" />
                <Paragraph>Generating your music... {progress}% complete</Paragraph>
              </Spin>
            </Card>
          )}

          {optimizedPrompt && (
            <Card title="Generated Music">
              <Paragraph>
                <strong>Generation Message:</strong> {optimizedPrompt}
              </Paragraph>
              {audioUrl && (
                <>
                  <audio controls src={audioUrl} style={{ width: '100%' }} />
                  <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
                    Download Music
                  </Button>
                </>
              )}
            </Card>
          )}
        </Space>
      </Content>
    </Layout>
  );
}

export default App;
