const LoadingWithGame = () => (
    <div>
      <h3>Loading... Please play this game while you wait!</h3>
      <iframe
        height="500"
        style={{ width: '100%', border: 'none' }}
        scrolling="no"
        title="Tetris"
        src="https://codepen.io/toni-leigh/embed/gOZrXw?height=500&theme-id=dark&default-tab=result"
        frameBorder="no"
        loading="lazy"
        allowTransparency="true"
        allowFullScreen="true"
      >
        See the Pen <a href="https://codepen.io/toni-leigh/pen/gOZrXw">Tetris</a> by Toni Leigh Sharpe.
      </iframe>
    </div>
  );
  
  export default LoadingWithGame;