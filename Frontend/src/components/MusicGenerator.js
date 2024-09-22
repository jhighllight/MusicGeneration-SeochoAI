import React, { useState } from 'react';
import { generateMusic } from '../services/musicService';

function MusicGenerator() {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setGeneratedPrompt('');

    try {
      const result = await generateMusic(userInput);
      setGeneratedPrompt(result.generated_prompt);
      setUserInput('');
    } catch (err) {
      setError('Error generating music. Please try again.');
      console.error('Error generating music:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Generate Music</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter music keywords"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Music'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {generatedPrompt && (
        <div>
          <h3>Generated Prompt:</h3>
          <p>{generatedPrompt}</p>
        </div>
      )}
    </div>
  );
}

export default MusicGenerator;