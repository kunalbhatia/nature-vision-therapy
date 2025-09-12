import { useEffect, useState } from 'react';
import StoryDisplay from './components/StoryDisplay';
import Controls from './components/Controls';
import StoryGenerator from './components/StoryGenerator';

import './index.css';
import Navbar from './components/NavBar';
import Modal from './components/Modal';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import { useSnackbar } from './hooks/Snackbar';
import useAuthStatus from './hooks/AuthStatus';
import Personalization from './components/Personalization';

function App() {
  const { showMessage } = useSnackbar();
  const { isLoggedIn: isAuthenticated, user } = useAuthStatus();

  const [modalType, setModalType] = useState<'login' | 'signup' | 'personalize' | null>(null);

  const [fontSize, setFontSize] = useState(1.5);

  const [selectedStory, setSelectedStory] = useState<{ content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  const handleTopicSelect = (topic: string) => {
    setIsLoading(true);
    setSelectedStory(null);
    StoryGenerator({ topic })
      .then(story => {
        setSelectedStory({ content: story });
      })
      .catch(error => {
        console.error('Error generating story:', error);
        setSelectedStory({ content: 'Failed to generate story.' });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    fetch('/api/pingMongo')
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error('Error pinging MongoDB:', err));
  }, []);
  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);
  useEffect(() => {
    console.log('User:', user);
  }, [user]);
  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        showMessage(data.message || 'Logged out', data.status);
        setIsLoggedIn(false);
      })
      .catch(err => {
        console.error('Logout error:', err);
        showMessage('Logout failed', 'error');
      });
  };
  return (
    <div
      className='min-h-screen flex flex-col items-center'
      style={{
        backgroundImage: 'url(./trees.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Navbar
        onLogin={() => setModalType('login')}
        onLogout={handleLogout}
        onConfigure={() => setModalType('personalize')}
        onSignup={() => setModalType('signup')}
        isLoggedIn={isLoggedIn}
      />
      <div className='min-h-fit bg-black text-white flex flex-col items-center justify-start p-6 shadow-lg rounded-md w-full '>
        <Controls onTopicSelect={handleTopicSelect} fontSize={fontSize} setFontSize={setFontSize} />
        <StoryDisplay
          isLoading={isLoading}
          story={selectedStory ? { content: selectedStory.content } : null}
          fontSize={fontSize}
        />
      </div>

      {modalType === 'login' && (
        <Modal title='Login' onClose={() => setModalType(null)}>
          <LoginForm
            onLogin={() => setModalType(null)}
            onStatusUpdate={(message, status) => {
              if (status === 'success') setIsLoggedIn(true);
              showMessage(message, status);
            }}
          />
        </Modal>
      )}
      {modalType === 'signup' && (
        <Modal title='Sign Up' onClose={() => setModalType(null)}>
          <SignupForm
            onSignup={() => setModalType(null)}
            onStatusUpdate={(message, status) => showMessage(message, status)}
          />
        </Modal>
      )}
      {modalType === 'personalize' && (
        <Modal title='Perzonalization' onClose={() => setModalType(null)}>
          <Personalization />
        </Modal>
      )}
    </div>
  );
}

export default App;
