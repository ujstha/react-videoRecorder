/* eslint-env browser */
import React from 'react';
import uuid from 'uuid';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardActionArea, CardActions, Button } from '@material-ui/core';
import { Alert, Modal, ModalBody } from 'reactstrap';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import { Player, ControlBar, ForwardControl } from 'video-react';
import '../App.css';

const styles = theme =>({
  card: {
    maxWidth: '100%',
  },
});

const videoType = 'video/webm';

class VideoRecorder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      canSend: false,
      videoURL: null,
      visible: false,
      backdrop: 'static',
      alertColor: '',
      alertMessage: '',
      alertIcon: ''
      /*videos: []*/
    };
    this.onDismiss = this.onDismiss.bind(this);
  }

  componentDidMount() {
    this.initiateRecording();
  }

  initiateRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    // show it to user
    this.video.srcObject = stream;
    this.video.play();
    // init recording
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: videoType
    });
    // init data storage for video chunks
    this.chunks = [];
    // listen for data from media recorder
    this.mediaRecorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };
  }

  startRecording = async (e) => {
    e.preventDefault();
    // wipe old data chunks
    this.chunks = [];
    // start recorder with 10ms buffer
    this.mediaRecorder.start(10);
    // say that we're recording
    await this.setState({ recording: true, canSend: false });
  }

  stopRecording = async (e) => {
    e.preventDefault();
    // stop the recorder
    this.mediaRecorder.stop();
    // say that we're not recording
    await this.setState({ recording: false, canSend: true });
    // save the video to memory
    this.saveVideo();
  }

  restartRecording = () => {
    this.initiateRecording();
    this.setState({ recording: false, videoURL: null, canSend: false });
  }

  displayButton = () => {
    if (this.state.canSend && (this.state.videoURL != null)) {
      return (
        <div>
          <Button size="large" color="primary"
            onClick={() => {
              this.restartRecording();
            }}
          >
            Restart Recording
          </Button>
          <Button size="large" color="primary"
            onClick={() => {
              this.submitVideo(this.state.video);
            }}
          >
            Submit
          </Button>
          <a className="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeLarge" tabIndex="0" type="button" href={this.state.videoURL} download={uuid()+".mp4"}>
            <span className="MuiButton-label">Download</span>
            <span className="MuiTouchRipple-root"></span>
          </a>
        </div>
      );
    } 
    else if (this.state.videoURL == null) {
      return (
        (this.state.recording === false) ? 
          <Button size="large" color="primary" onClick={e => this.startRecording(e)}>
            Start Recording
          </Button> : 
          <Button size="large" color="primary" onClick={e => this.stopRecording(e)}>
            Stop Recording
          </Button>
      )
    }
  }

  saveVideo = () => {
    // convert saved chunks to blob
    const blob = new Blob(this.chunks, {type: videoType});
    // generate video url from blob
    const videoURL = window.URL.createObjectURL(blob);
    // append videoURL to list of saved videos for rendering
    //const videos = this.state.videos.concat([videoURL]);
    this.setState({ video: blob });
    this.setState({ videoURL });
    //console.log(videoURL, 'vidURL');
  }

  videoDisplay = () => {
    if (this.state.videoURL != null) {
      return (
        <CardActionArea>
          <Player>
            <source src={this.state.videoURL} />
            <ControlBar autoHide={true}>
              <ForwardControl seconds={5} order={3.1} />
            </ControlBar>
          </Player>
        </CardActionArea>
      )
    } 
    else if (this.state.videoURL == null) {
      return(
        <CardActionArea>
          <video
            style={{width: '100%', height: '400'}}
            ref={v => {
              this.video = v;
            }}
            muted
          >
            Video stream not available.
          </video>
        </CardActionArea>
      )
    }
  }

  submitVideo = (video) => {
    //console.log(video, 'video');
    var url = window.location.href+'single';
    const formData = new FormData();
    formData.append('profile', video, uuid() + '.mp4');

    fetch(url, {
      method: 'POST', // or 'PUT'
      mode: 'no-cors',
      body: formData
    }).then(res => {
      this.setState({ 
        visible: true, 
        alertColor: 'success', 
        alertMessage: 'CONGRATS! Your video has been uploaded.',
        alertIcon: <CheckCircleIcon />,
        canSend: false,
        videoURL: null
      })
      this.initiateRecording();
    }).catch(err => {
      this.setState({ 
        visible: true, 
        alertColor: 'danger', 
        alertMessage: 'OOPS! Your video was not uploaded.',
        alertIcon: <ErrorIcon />,
        canSend: true,
        videoURL: this.state.videoURL
      })
      return (
        <CardActionArea>
          <Player>
            <source src={this.state.videoURL} />
            <ControlBar autoHide={true}>
              <ForwardControl seconds={5} order={3.1} />
            </ControlBar>
          </Player>
        </CardActionArea>
      )
    });
  }

  onDismiss = () => {
    this.setState({ 
      visible: false
    });
  }

  render() {
    //const { recording, videoURL } = this.state;
    const { classes } = this.props;

    return (
      <div className='row'>
        <div className='mt-5 col-lg-6 offset-lg-3'>
          <Card className={classes.card}>
            {this.videoDisplay()}
            <CardActions>
              {this.displayButton()}
            </CardActions>
            <Modal className="modal-lg" isOpen={this.state.visible} toggle={this.onDismiss} backdrop={this.state.backdrop}>
              <ModalBody>
                <Alert color={this.state.alertColor} isOpen={this.state.visible} toggle={this.onDismiss}>
                  {this.state.alertIcon}
                  {this.state.alertMessage}
                </Alert>
              </ModalBody>
            </Modal>
          </Card>
          {/*console.log(videoURL)*/}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(VideoRecorder);