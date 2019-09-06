import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';

import VideoRecorder from './components/VideoRecorder';
import "../node_modules/video-react/dist/video-react.css";
import './App.css';

class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <CssBaseline />
        <Container maxWidth="lg">
          <VideoRecorder />
        </Container>
      </React.Fragment>
    );
  }
}

export default App;
