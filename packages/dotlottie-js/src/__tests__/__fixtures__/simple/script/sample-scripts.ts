export const HelloWorldScript = {
  id: 'hello-world',
  data: 'console.log("Hello, world!");',
};

export const AnimationControlScript = {
  id: 'animation-control',
  name: 'Animation Control Script',
  data: `function onReady(animation) {
  animation.play();
  animation.addEventListener('complete', () => {
    animation.goToAndPlay(0);
  });
}`,
};
