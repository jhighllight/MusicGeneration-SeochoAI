import React, { useState, useEffect } from 'react';
import { getGeneratedMusics } from '../services/musicService';

function MusicList() {
  const [musics, setMusics] = useState([]);

  useEffect(() => {
    fetchMusics();
  }, []);

  const fetchMusics = async () => {
    try {
      const fetchedMusics = await getGeneratedMusics();
      setMusics(fetchedMusics);
    } catch (error) {
      console.error('Error fetching musics:', error);
    }
  };

  return (
    <div>
      <h2>Generated Music List</h2>
      <ul>
        {musics.map((music) => (
          <li key={music.id}>
            <p>{music.prompt}</p>
            <audio controls src={`${process.env.REACT_APP_API_URL}/audio/${music.fileName}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MusicList;