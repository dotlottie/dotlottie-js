import { useEffect, useRef, useState } from 'react';
import '@dotlottie/player-component';
import './App.css';
import { DotLottie } from '@dotlottie/dotlottie-js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // add your component to IntrinsicElements
      'lottie-player': any;
      'dotlottie-player': any;
    }
  }
}

function App() {
  const [lottieData, setLottieData] = useState({});
  const playerRef: React.Ref<any> = useRef();

  useEffect(() => {
    const createDotLottie = async () => {
      const dotlottie = new DotLottie();

      await dotlottie
        .setAuthor('Joe')
        .setVersion('1.0')
        .addAnimation({
          id: 'animation_1',
          url: 'https://lottie.host/18b639d1-a200-4225-ba0e-3456d40f95a5/wlrsaqWa8r.json',
          autoplay: true,
        })
        .addAnimation({
          id: 'animation_2',
          url: 'https://lottie.host/cf7b43d1-3d6b-407a-970b-6305b18bebfa/uB1Jboo1o1.json',
          autoplay: true,
        })
        .build()
        .then((value) => {
          value.download('animation.lottie');
        });

      let animation = await dotlottie.getAnimation('animation_1');

      if (animation) {
        const animationData = await animation.toJSON();

        if (animationData) {
          setLottieData(animationData);

          if (playerRef.current) {
            playerRef.current.load(animationData);
          }
        }
      }
    };

    createDotLottie();
  }, []);

  return (
    <div className="App">
      <div>
        <h3>This page will download a dotLottie created in useEffect!</h3>
        {lottieData && (
          <div style={{ justifyContent: 'center', margin: 'auto' }}>
            <dotlottie-player ref={playerRef} autoplay loop></dotlottie-player>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
