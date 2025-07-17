import { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface Signature{
  setSignature: (data: string)=>void
}

export default function ESignature({ setSignature }: Signature) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(500);
  const canvasHeight = 200;
  

  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasWrapperRef.current) {
        setCanvasWidth(canvasWrapperRef.current.offsetWidth);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignature('');
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      const data = sigCanvas.current.toDataURL();
      setSignature(data); 
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div ref={canvasWrapperRef} className="w-full rounded-lg overflow-hidden">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: canvasWidth,
            height: canvasHeight,
            className: 'block w-full h-auto',
          }}
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <button className="cursor-pointer text-limeTxt hover:underline" onClick={clearSignature}>
          Clear Signature
        </button>
        <button
          className="cursor-pointer px-4 py-2 bg-bgColor text-limeTxt rounded-lg hover:bg-green-800 hover:text-white"
          onClick={saveSignature}
        >
          Save Signature
        </button>
      </div>
    </div>
  );
}
