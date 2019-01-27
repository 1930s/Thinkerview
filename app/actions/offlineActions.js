import { Platform } from "react-native";
import {
  SELECT_OFFLINE_PODCAST,
  SAVE_PODCAST_OFFLINE,
  SAVE_PODCAST_OFFLINE_UPDATE,
  SAVE_PODCAST_OFFLINE_ERROR,
  DELETE_PODCAST_OFFLINE,
  DELETE_PODCAST_OFFLINE_ERROR
} from "./types";
import RNFetchBlob from "rn-fetch-blob";
import { hasPath, pathOr } from "ramda";

const testMP3 = "http://www.hubharp.com/web_sound/BachGavotteShort.mp3";

const downloadPodcast = (dispatch, podcast) =>
  new Promise((resolve, reject) => {
    let audio_link = pathOr(false, ["audio_link"], podcast);

    if (!audio_link) {
      reject();
    } else {
      if (typeof audio_link === "string") {
        audio_link.slice(0, audio_link.length - 11);
      } else {
        reject();
      }
    }

    RNFetchBlob.config({
      IOSBackgroundTask: true,
      fileCache: true,
      overwrite: true,
      path: RNFetchBlob.fs.dirs.DocumentDir + "/" + podcast.id + ".mp3"
    })
      .fetch("GET", audio_link)
      .progress({ interval: 4000 }, (received, total) => {
        dispatch({
          type: SAVE_PODCAST_OFFLINE_UPDATE,
          podcast: podcast,
          key: "progress",
          value: String(Math.floor((received / total) * 100))
        });
      })
      .then(res => {
        dispatch({
          type: SAVE_PODCAST_OFFLINE_UPDATE,
          podcast: podcast,
          key: "path",
          value: Platform.OS === "ios" ? "file://" + res.path() : res.path()
        });
        resolve();
      })
      .catch(err => {
        console.log(err);
        dispatch({
          type: SAVE_PODCAST_OFFLINE_ERROR,
          podcast
        });
        reject();
      });
  });

// RNFetchBlob has issue with parrallel download atm
const downloadImage = (dispatch, podcast) =>
  new Promise((resolve, reject) => {
    RNFetchBlob.config({
      IOSBackgroundTask: true,
      fileCache: true,
      path: RNFetchBlob.fs.dirs.DocumentDir + "/" + podcast.id + ".jpg"
    })
      .fetch("GET", podcast.img_url)
      .then(res => {
        dispatch({
          type: SAVE_PODCAST_OFFLINE_UPDATE,
          podcast: podcast,
          key: "image_offline",
          value: res.path()
        });
        resolve();
      })
      .catch(err => {
        console.log(err);
        reject();
      });
  });

findPodcast = (data, id) => {
  return data.find(item => {
    return item.id == id;
  });
};

export const selectOfflinePodcast = podcast => {
  return {
    type: SELECT_OFFLINE_PODCAST,
    podcast
  };
};

export const savePodcastOffline = podcast => {
  return (dispatch, getState) => {
    if (!hasPath(["id"], podcast)) {
      return dispatch({
        type: ""
      });
    }
    dispatch({
      type: SAVE_PODCAST_OFFLINE,
      podcast
    });
    return dispatch(savePodcastOfflineStart(podcast));
  };
};

export const savePodcastOfflineStart = podcast => {
  return async (dispatch, getState) => {
    let shouldStartDownload = false;

    const podcastInTheList = findPodcast(getState().offline.data, podcast.id);

    if (podcastInTheList) {
      if (podcastInTheList.progress === "0") {
        dispatch({
          type: SAVE_PODCAST_OFFLINE_UPDATE,
          podcast: podcast,
          key: "progress",
          value: "1"
        });
        shouldStartDownload = true;
      }
    }

    if (shouldStartDownload) {
      // no image download for the moment because 2 RNFetchBlob result in nothing is done
      // await downloadImage(dispatch, podcast);
      await downloadPodcast(dispatch, podcast);
    }
  };
};

export const deletePodcastOffline = podcast => {
  console.log(podcast);
  if (hasPath(["path"], podcast)) {
    return (dispatch, getState) => {
      RNFetchBlob.fs
        .unlink(podcast.path)
        .then(() => {
          dispatch({
            type: DELETE_PODCAST_OFFLINE,
            podcast
          });
        })
        .catch(err => {
          console.log(err);
          dispatch({
            type: DELETE_PODCAST_OFFLINE_ERROR
          });
        });
    };
  } else {
    return {
      type: DELETE_PODCAST_OFFLINE,
      podcast
    };
  }
};
