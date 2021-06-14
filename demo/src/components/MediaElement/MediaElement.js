import {useEffect, useRef, useState} from "preact/compat";
import style from "./style.scss";
import useAudio from "../Audio/useAudio";

const YT_DOWNLOAD_API = "https://dj-truck-yt-api.herokuapp.com/api/stream?url="

const urls = [
    'https://www.youtube.com/watch?v=q5hTAPpVKA8',
    'https://www.youtube.com/watch?v=d_xeHlcaZ1Q',
    'https://www.youtube.com/watch?v=n-wEvzqdDZg',
    'https://www.youtube.com/watch?v=Z8k35CUzVvM'
]

const MediaElement = () => {
    const mediaElement =  useRef(null);
    const [src, setSrc] = useState(null);
    const [audio] = useAudio()



    useEffect(() => {
        window.addEventListener("click", () => {
            audio.connectSource(mediaElement.current);
        }, {once: true})
    }, [mediaElement])


    useEffect(() => {
        if(!mediaElement.current || !src)
            return;
        mediaElement.current.setAttribute('src', YT_DOWNLOAD_API + src)
    }, [src, mediaElement])

    const clear = () => setSrc("")

    return (
        <div className={style['media-element']}>
            <h5>Youtube sources:</h5>
            <select multiple className={style['media-element__urls']} onChange={e => setSrc(e.target.value)}>
                {urls.map(url => <option value={url}>{url}</option>)}
            </select>
            <div>
                <h6>Paste yt link</h6>
                <div className={style['media-element__source-group']}>
                    <input
                        className={style['media-element__source-input']}
                        value={src}
                        type="text" onInput={event => setSrc(event.target.value)}/>
                    <button onClick={clear}>x</button>
                </div>
            </div>
            <audio controls="true" ref={mediaElement} crossorigin="anonymous"></audio>
        </div>
    )
}

export default MediaElement;