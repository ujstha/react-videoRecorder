/* eslint-env browser */
import React from 'react';
import uuid from 'uuid';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import { Player, ControlBar } from 'video-react';

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
      /*videos: []*/
    };
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

  submitVideo = (video) => {
    //console.log(video, 'video');
    var url = 'http://localhost:8000/single';
    const formData = new FormData();
    formData.append('profile', video, uuid() + '.mp4');

    fetch(url, {
      method: 'POST', // or 'PUT'
      mode: 'no-cors',
      body: formData
    });
    this.setState({ canSend: false });
  }

  videoDisplay = () => {
    if (this.state.videoURL != null) {
      return (
        <CardActionArea>
          <Player>
            <source src={this.state.videoURL} />
            <ControlBar autoHide={true} />
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
          </Card>
        {/*console.log(videoURL, 'yaha tala')*/}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(VideoRecorder);