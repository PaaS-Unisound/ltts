import React, { useEffect, useRef, useState } from 'react';
import style from './tts.less';
import Speaker from './Speaker';
import { Slider, Button, Popover } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Axios from 'axios';
import { sha256 } from 'js-sha256';
import { Config, AiCode } from '@/config';
interface Props {
  voiceList: Array<any>;
  aiCode: string;
  maxLength: number;
}

export default ({ voiceList = [], aiCode, maxLength = 500 }: Props) => {
  const audio: any = useRef();
  const [selected, setSelected] = useState<any>(
    voiceList.length > 0 ? voiceList[0] : null,
  );
  const { appKey, secret, path } = Config[AiCode.TTSLong];

  const [speed, setSpeed] = useState<number>(50);
  const [volume, setVolume] = useState<number>(50);
  const [pitch, setPitch] = useState<number>(50);
  const [bright, setBright] = useState<number>(50);
  const [buildStatus, setStatus] = useState<number>(0);
  useEffect(() => {
    if (voiceList.length > 0) {
      setSelected(voiceList[0]);
      if (voiceList[0].playText) {
        setPlayText(voiceList[0].playText);
      }
    }
  }, [voiceList]);

  const [playText, setPlayText] = useState<string>(
    '云知声智能科技股份有限公司，成立于2012年6月29日，是语音行业发展最快的移动互联网公司。',
  );

  function startWs() {
    const tm: number = +new Date();
    const sign = sha256(`${appKey}${tm}${secret}`).toUpperCase();

    setStatus(1);
    Axios.post(`${path}/start`, {
      appkey: appKey,
      time: tm,
      sign: sign,
      user_id: 'test_123123',
      format: 'wav',
      vcn: selected.code,
      text: playText,
      sample: 16000,
      speed,
      volume,
      pitch,
      bright,
    })
      .then((res: any) => {
        let taskId = res.data.task_id;
        if (taskId) {
          getResult(taskId);
          Axios.post('/manager/product/experience', {
            aiCode,
            sid: taskId,
          });
        }
      })
      .catch(() => {
        setStatus(0);
      });
    // let timer: number
    function getResult(taskId: string | number) {
      Axios.post(`${path}/progress`, {
        appkey: appKey,
        time: tm,
        sign: sign,
        user_id: 'test_123123',
        task_id: taskId,
      })
        .then((res: any) => {
          if (res.data.task_status !== 'done') {
            setTimeout(() => {
              getResult(taskId);
            }, 1000);
          } else {
            // alert(res.audio_address);
            if (audio.current) {
              setStatus(1);
              audio.current.src = res.data.audio_address;
              audio.current.play();
            }
          }
        })
        .catch(() => {
          setStatus(0);
        });
    }
  }

  return (
    <div className={style.tts}>
      <div className={style.voice}>
        <div className={style.speakers}>
          {voiceList.map((item: any) => {
            return (
              <Speaker
                key={item.code}
                onClick={() => {
                  setSelected(item);
                  if (item.playText) {
                    setPlayText(item.playText);
                  }
                  setStatus(0);
                  if (audio.current) {
                    audio.current.pause();
                  }
                }}
                {...item}
                isSelect={item.code === (selected && selected.code)}
              />
            );
          })}
        </div>
        <div className={style.settings}>
          <div className={style.row}>
            <span className={style.label}>音量：</span>
            <span className={style.tag}>小</span>
            <span className={style.slider}>
              <Slider
                value={volume}
                onChange={(v: number) => {
                  setVolume(v);
                }}
              />
            </span>
            <span className={style.tag}>大</span>
          </div>
          <div className={style.row}>
            <span className={style.label}>语速：</span>
            <span className={style.tag}>慢</span>
            <span className={style.slider}>
              <Slider
                value={speed}
                tipFormatter={(value: number | undefined = 50) => {
                  return (
                    <span> {Math.round((value + 50) / 10) / 10 + 'X'} </span>
                  );
                }}
                onChange={(v: number) => {
                  setSpeed(v);
                }}
              />
            </span>
            <span className={style.tag}>快</span>
          </div>
          <div className={style.row}>
            <span className={style.label}>
              音高：
              <Popover
                content="代表调子高低，人耳感受上越高则越尖，越低则越粗犷，此参数建议保持默认值。"
                overlayStyle={{ width: 215 }}
              >
                <QuestionCircleOutlined />
              </Popover>
            </span>
            <span className={style.tag}>低</span>
            <span className={style.slider}>
              <Slider
                value={pitch}
                onChange={(v: number) => {
                  setPitch(v);
                }}
              />
            </span>
            <span className={style.tag}>高</span>
          </div>
          <div className={style.row}>
            <span className={style.label}>
              亮度：
              <Popover
                content="代表声音的清晰程度，适当的提高亮度可以让声音听起来更加清晰，过度的增加则会导致细节丢失。此参数建议保持默认值。"
                overlayStyle={{ width: 215 }}
              >
                <QuestionCircleOutlined />
              </Popover>
            </span>
            <span className={style.tag}>低</span>
            <span className={style.slider}>
              <Slider
                value={bright}
                onChange={(v: number) => {
                  if (v < 50) {
                    setBright(50);
                  } else {
                    setBright(v);
                  }
                }}
              />
            </span>
            <span className={style.tag}>高</span>
          </div>
        </div>
      </div>
      <div className={style.textPlay}>
        <TextArea
          className={style.textarea}
          value={playText}
          onChange={(e: any) => {
            setPlayText(e.target.value);
          }}
          bordered={false}
          maxLength={maxLength}
        />
        <div className={style.btns}>
          <div className={style.textCount}>
            {playText.length}/{maxLength}
          </div>
          <Button
            type="primary"
            loading={buildStatus === 1}
            onClick={() => {
              if (buildStatus === 0) {
                startWs();
              } else {
                // setPlaying(false);
                audio.current && audio.current.pause();
              }
            }}
          >
            {buildStatus === 0 && '播放'}
            {buildStatus === 1 && '合成中'}
            {buildStatus === 2 && '停止'}
          </Button>
        </div>
      </div>
      <audio
        ref={audio}
        autoPlay={true}
        onEnded={() => {
          setStatus(0);
        }}
      ></audio>
    </div>
  );
};
