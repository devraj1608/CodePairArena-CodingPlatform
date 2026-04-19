'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Timer from './Timer.jsx';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
const Executing = dynamic(() => import('../EditorComponent/Executing.jsx'), { ssr: false });
const ExampleCasesOutput = dynamic(() => import('../EditorComponent/ExampleCasesOutput.jsx'), { ssr: false });

// ─── ParticipantVideo is at MODULE level (NOT inside GroupRoom) ────────────────
// If defined inside GroupRoom, React recreates the component type on every render
// which unmounts + remounts the <video> element and wipes srcObject. Module-level
// placement gives the component a stable identity so the DOM node is preserved.
function ParticipantVideo({ stream, user, isHost }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{position:'relative',borderRadius:'10px',overflow:'hidden',background:'rgba(30,10,60,0.85)',border:'1px solid rgba(139,92,246,0.35)',aspectRatio:'4/3',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
      {stream ? (
        <video ref={videoRef} autoPlay playsInline style={{width:'100%',height:'100%',objectFit:'cover'}}/>
      ) : (
        <img src={user?.avatar||'/default-avatar.png'} alt={user?.username}
          style={{width:'36px',height:'36px',borderRadius:'50%',border:'2px solid rgba(167,139,250,0.6)',objectFit:'cover'}}/>
      )}
      <div style={{position:'absolute',bottom:'4px',left:'4px',right:'4px',background:'rgba(0,0,0,0.7)',borderRadius:'6px',padding:'2px 5px',display:'flex',alignItems:'center',gap:'4px'}}>
        <div style={{width:'5px',height:'5px',borderRadius:'50%',background:stream?'#4ade80':'#fbbf24',flexShrink:0}}/>
        <span style={{fontSize:'9px',color:'white',fontWeight:'700',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.username ? user.username + (isHost ? ' (Host)' : '') : 'Participant'}</span>
      </div>
    </div>
  );
}

export default function GroupRoom({
  roomId, privilege, participants, requestUsername, streamActive, hostSocketId,
  remoteStreams, replaceStream, localUser,
  cases, executing, exampleCasesExecution, language, theme, code,
  isAudioOn, isVideoOn, myStream, showQuestion, question, problems,
  loadingProblems, copySuccess, setTheme, setMyStream, cameraStreamRef,
  setAudioOn, setVideoOn, setExampleCasesExecution, setShowQuestion,
  exitRoom, handleCopy, acceptRequest, denyRequest, removeParticipant,
  handleLanguageChange, handleProblemSelect, handleInputChange,
  changeCode, changeQuestion, clickRun,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Self-view video ref
  const selfVideoRef = useRef(null);
  useEffect(() => {
    if (selfVideoRef.current && myStream) {
      selfVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  const overlay = mounted && privilege && requestUsername.length > 0
    ? createPortal(
        <div style={{position:'fixed',top:'16px',left:'50%',transform:'translateX(-50%)',zIndex:99999,display:'flex',flexDirection:'column',gap:'8px',width:'440px'}}>
          {requestUsername.map((x, i) => (
            <div key={x.joinerSocketId || i} style={{display:'flex',alignItems:'center',gap:'12px',background:'rgba(8,2,0,0.97)',border:'2px solid #eab308',borderRadius:'16px',padding:'12px 16px',boxShadow:'0 8px 32px rgba(234,179,8,0.3)'}}>
              <div style={{position:'relative',flexShrink:0}}>
                <img style={{height:'44px',width:'44px',borderRadius:'50%',border:'2px solid #eab308'}} src={x.user?.avatar||'/default-avatar.png'} alt={x.user?.username}/>
                <span style={{position:'absolute',top:'-4px',right:'-4px',width:'18px',height:'18px',background:'#eab308',borderRadius:'50%',border:'2px solid black',display:'flex',alignItems:'center',justifyContent:'center',color:'black',fontWeight:'900',fontSize:'10px'}}>!</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontSize:'14px',fontWeight:'900',color:'white',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{x.user?.username}</p>
                <p style={{margin:0,fontSize:'11px',fontWeight:'700',color:'#fbbf24'}}>{x.streamStarted ? '🔴 Joining live' : '🔔 Requesting to join'}</p>
              </div>
              <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                <button onClick={() => acceptRequest(i)} style={{padding:'8px 14px',background:'#16a34a',color:'white',fontWeight:'900',borderRadius:'12px',fontSize:'12px',border:'none',cursor:'pointer'}}>✓ Accept</button>
                <button onClick={() => denyRequest(i)} style={{padding:'8px 14px',background:'#b91c1c',color:'white',fontWeight:'900',borderRadius:'12px',fontSize:'12px',border:'none',cursor:'pointer'}}>✕ Deny</button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )
    : null;


  const startScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      
      // Combine screen video track and camera audio track
      const tracks = [];
      if (displayStream.getVideoTracks().length > 0) {
        tracks.push(displayStream.getVideoTracks()[0]);
      }
      if (cameraStreamRef.current && cameraStreamRef.current.getAudioTracks().length > 0) {
        tracks.push(cameraStreamRef.current.getAudioTracks()[0]);
      }
      
      const combinedStream = new MediaStream(tracks);
      
      // Setting myStream to combinedStream triggers the useEffect in useGroupWebRTC
      // which automatically replaces tracks for all existing peers
      // and ensures new peers get both the screen and microphone!
      setMyStream(combinedStream);
      
      // Show screen share locally too
      if (selfVideoRef.current) selfVideoRef.current.srcObject = combinedStream;

      displayStream.getVideoTracks()[0].onended = () => {
        setMyStream(cameraStreamRef.current);
        if (selfVideoRef.current) selfVideoRef.current.srcObject = cameraStreamRef.current;
      };
    } catch (err) {
      console.error("Screen share error", err);
    }
  };

  return (
    <div style={{height:'calc(100vh - 10px)',marginTop:'10px',display:'flex',color:'white',overflow:'hidden',position:'relative',background:'linear-gradient(135deg,#1a0035 0%,#2d0060 30%,#150040 60%,#0a001f 100%)'}}>
      {overlay}
      <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
        <div style={{position:'absolute',top:0,left:'33%',width:'500px',height:'400px',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(168,85,247,0.15) 0%,transparent 70%)'}}/>
        <div style={{position:'absolute',bottom:0,right:'25%',width:'350px',height:'350px',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(217,70,239,0.12) 0%,transparent 70%)'}}/>
      </div>
      <div style={{position:'relative',zIndex:10,width:'100%',height:'100%',display:'flex',gap:'12px',padding:'12px'}}>

        {/* LEFT */}
        <div style={{width:'22%',height:'100%',display:'flex',flexDirection:'column',gap:'12px'}}>
          <div style={{background:'rgba(88,28,135,0.55)',border:'1px solid rgba(168,85,247,0.4)',borderRadius:'16px',padding:'12px',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{width:'8px',height:'8px',background:'#ef4444',borderRadius:'50%',animation:'pulse 2s infinite'}}/>
                <span style={{fontSize:'10px',fontWeight:'900',color:'#f87171',letterSpacing:'2px',textTransform:'uppercase'}}>Live</span>
              </div>
              <span style={{fontSize:'10px',fontWeight:'700',padding:'2px 8px',borderRadius:'12px',border:'1px solid rgba(168,85,247,0.4)',background:'rgba(109,40,217,0.4)',color:'#d8b4fe'}}>{participants.length+1} online</span>
            </div>
            <div style={{textAlign:'center',padding:'8px',borderRadius:'12px',fontSize:'10px',fontWeight:'900',letterSpacing:'3px',background:'linear-gradient(to right,rgba(88,28,135,0.7),rgba(112,26,117,0.7))',border:'1px solid rgba(232,121,249,0.4)',color:'#f0abfc',marginBottom:'10px'}}>👥 GROUP SESSION</div>
            <div style={{display:'flex',justifyContent:'space-around'}}>
              <button onClick={exitRoom} style={{background:'#dc2626',border:'none',padding:'10px',borderRadius:'12px',cursor:'pointer'}}><img style={{height:'16px',width:'16px'}} src="/endcall.png" alt="end"/></button>
              <button onClick={()=>{if(myStream){const t=myStream.getAudioTracks()[0];if(t){t.enabled=!t.enabled;setAudioOn(t.enabled);}}}} style={{background:isAudioOn?'#374151':'#dc2626',border:'none',padding:'10px',borderRadius:'12px',cursor:'pointer'}}><img style={{height:'16px',width:'16px'}} src={isAudioOn?'/micon.png':'/micoff.png'} alt="mic"/></button>
              <button onClick={()=>{if(myStream){const t=myStream.getVideoTracks()[0];if(t){t.enabled=!t.enabled;setVideoOn(t.enabled);}}}} style={{background:isVideoOn?'#374151':'#dc2626',border:'none',padding:'10px',borderRadius:'12px',cursor:'pointer'}}><img style={{height:'16px',width:'16px'}} src={isVideoOn?'/camera-on.png':'/camera-off.png'} alt="cam"/></button>
            </div>
          </div>

          <div style={{background:'rgba(76,29,149,0.4)',border:'1px solid rgba(139,92,246,0.35)',borderRadius:'16px',padding:'12px',flex:1,minHeight:0,display:'flex',flexDirection:'column'}}>

            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px',flexShrink:0}}>
              <h3 style={{margin:0,fontSize:'10px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'2px',color:'#e879f9'}}>Participants</h3>
              <span style={{fontSize:'11px',fontWeight:'700',padding:'2px 8px',borderRadius:'12px',background:participants.length>0?'rgba(21,128,61,0.3)':'rgba(109,40,217,0.3)',border:participants.length>0?'1px solid rgba(74,222,128,0.4)':'1px solid rgba(139,92,246,0.3)',color:participants.length>0?'#86efac':'#a78bfa'}}>{participants.length}</span>
            </div>
            <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'8px'}}>
              {participants.length>0 ? participants.map((p,i)=>(
                <div key={p.id||i} style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(107,33,168,0.35)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:'12px',padding:'8px'}}>
                  <div style={{position:'relative',flexShrink:0}}>
                    <img src={p.user?.avatar||'/default-avatar.png'} alt={p.user?.username} style={{height:'28px',width:'28px',borderRadius:'50%',border:'2px solid rgba(167,139,250,0.5)'}}/>
                    <span style={{position:'absolute',bottom:'-2px',right:'-2px',width:'8px',height:'8px',background:'#4ade80',borderRadius:'50%',border:'1px solid black'}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{margin:0,fontSize:'11px',fontWeight:'600',color:'white',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.user?.username}</p>
                    <p style={{margin:0,fontSize:'10px',color:'#c084fc'}}>● Connected</p>
                  </div>
                  {privilege && <button onClick={()=>removeParticipant(p.id)} style={{background:'none',border:'none',color:'#f87171',cursor:'pointer',fontSize:'12px',padding:'2px 4px'}}>✕</button>}
                </div>
              )) : (
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
                  <div style={{fontSize:'28px',opacity:0.2,marginBottom:'8px'}}>👥</div>
                  <p style={{margin:0,fontSize:'11px',color:'#7c3aed'}}>No participants yet</p>
                </div>
              )}
            </div>
          </div>

          <div style={{background:'rgba(76,29,149,0.4)',border:'1px solid rgba(139,92,246,0.35)',borderRadius:'16px',padding:'12px',flexShrink:0}}>
            <h3 style={{margin:'0 0 8px',fontSize:'10px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'2px',color:'#e879f9',textAlign:'center'}}>Test Cases</h3>
            {executing ? (
              <div style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(109,40,217,0.2)',border:'1px solid rgba(139,92,246,0.4)',borderRadius:'10px',padding:'8px'}}>
                <div style={{width:'12px',height:'12px',border:'2px solid #a78bfa',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',flexShrink:0}}/>
                <Executing text="Executing…"/>
              </div>
            ) : exampleCasesExecution ? (
              <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'144px',overflowY:'auto'}}>
                <ExampleCasesOutput exampleCasesExecution={exampleCasesExecution}/>
                <button style={{width:'100%',padding:'6px',borderRadius:'8px',background:'#dc2626',color:'white',fontWeight:'600',fontSize:'12px',border:'none',cursor:'pointer'}} onClick={()=>setExampleCasesExecution(null)}>🔄 Reset</button>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'176px',overflowY:'auto'}}>
                {cases.map((c,i)=>(
                  <div key={c.id} style={{background:'rgba(107,33,168,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:'10px',padding:'8px'}}>
                    <label style={{display:'block',fontSize:'9px',fontWeight:'600',color:'#a78bfa',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'3px'}}>Input</label>
                    <input type="text" value={c.input} readOnly={!privilege} onChange={e=>handleInputChange(i,'input',e.target.value)} style={{width:'100%',padding:'5px 8px',borderRadius:'8px',background:'rgba(46,16,101,0.6)',color:'white',border:'1px solid rgba(139,92,246,0.4)',fontSize:'11px',fontFamily:'monospace',boxSizing:'border-box',outline:'none'}}/>
                    <label style={{display:'block',fontSize:'9px',fontWeight:'600',color:'#a78bfa',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'3px',marginTop:'6px'}}>Expected</label>
                    <input type="text" value={c.output} readOnly={!privilege} onChange={e=>handleInputChange(i,'output',e.target.value)} style={{width:'100%',padding:'5px 8px',borderRadius:'8px',background:'rgba(46,16,101,0.6)',color:'white',border:'1px solid rgba(139,92,246,0.4)',fontSize:'11px',fontFamily:'monospace',boxSizing:'border-box',outline:'none'}}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{background:'rgba(76,29,149,0.4)',border:'1px solid rgba(139,92,246,0.35)',borderRadius:'16px',padding:'8px',flexShrink:0}}>
            <Timer previlige={privilege} remoteSocketId={null} roomId={roomId} isGroupMode={true}/>
          </div>
        </div>

        {/* CENTER */}
        <div style={{flex:1,background:'rgba(20,5,50,0.85)',border:'1px solid rgba(139,92,246,0.4)',borderRadius:'16px',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',borderBottom:'1px solid rgba(139,92,246,0.3)',background:'rgba(88,28,135,0.5)',flexShrink:0}}>
            <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
              <div style={{width:'8px',height:'8px',background:'#ef4444',borderRadius:'50%'}}/>
              <span style={{fontSize:'10px',fontWeight:'900',color:'#f0abfc',letterSpacing:'2px',textTransform:'uppercase'}}>Group Session</span>
              <div style={{width:'1px',height:'16px',background:'rgba(139,92,246,0.4)'}}/>
              <button onClick={clickRun} style={{padding:'6px 16px',background:'#16a34a',color:'white',fontWeight:'700',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'13px'}}>▶ Run</button>
              <button onClick={()=>setShowQuestion(p=>!p)} style={{padding:'6px 16px',background:'linear-gradient(to right,#7c3aed,#a21caf)',color:'white',fontWeight:'700',borderRadius:'8px',border:'1px solid rgba(232,121,249,0.5)',cursor:'pointer',fontSize:'13px'}}>📝 Question</button>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <select value={language} onChange={e=>handleLanguageChange(e.target.value)} style={{padding:'5px 8px',background:'rgba(88,28,135,0.6)',color:'white',border:'1px solid rgba(139,92,246,0.5)',borderRadius:'8px',fontSize:'13px',outline:'none'}}>
                <option value="cpp">C++</option><option value="c">C</option><option value="java">Java</option><option value="python">Python</option>
              </select>
              <select value={theme} onChange={e=>setTheme(e.target.value)} style={{padding:'5px 8px',background:'rgba(88,28,135,0.6)',color:'white',border:'1px solid rgba(139,92,246,0.5)',borderRadius:'8px',fontSize:'13px',outline:'none'}}>
                <option value="vs-dark">Dark</option><option value="light">Light</option><option value="hc-black">High Contrast</option>
              </select>
            </div>
          </div>
          {showQuestion && (
            <div style={{position:'absolute',zIndex:20,top:'56px',left:'22%',right:'27%',maxHeight:'70vh',overflowY:'auto',background:'rgba(10,2,28,0.98)',border:'1px solid rgba(232,121,249,0.5)',borderRadius:'12px',padding:'24px',boxShadow:'0 20px 60px rgba(0,0,0,0.8)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                <strong style={{fontSize:'17px',color:'#f0abfc'}}>Question</strong>
                <button onClick={()=>setShowQuestion(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer',fontWeight:'700'}}>✕</button>
              </div>
              <hr style={{borderColor:'rgba(139,92,246,0.4)',marginBottom:'12px'}}/>
              {privilege
                ? <textarea value={question} onChange={changeQuestion} style={{width:'100%',height:'256px',padding:'12px',border:'1px solid rgba(139,92,246,0.5)',borderRadius:'8px',background:'rgba(46,16,101,0.6)',color:'white',resize:'none',outline:'none',fontSize:'13px',boxSizing:'border-box'}}/>
                : <p style={{whiteSpace:'pre-wrap',fontSize:'13px',lineHeight:'1.6',color:'#d1d5db',margin:0}}>{question}</p>
              }
            </div>
          )}
          <div style={{flex:1,minHeight:0,padding:'12px'}}>
            <Editor height="100%" width="100%" language={language} value={code} theme={theme} onChange={changeCode}
              options={{fontSize:15,minimap:{enabled:false},scrollBeyondLastLine:false,automaticLayout:true,wordWrap:'on'}}/>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{width:'26%',height:'100%',display:'flex',flexDirection:'column',gap:'12px'}}>
          {privilege && (
            <div style={{background:'rgba(88,28,135,0.55)',border:'1px solid rgba(168,85,247,0.4)',borderRadius:'16px',padding:'12px',flexShrink:0}}>
              <p style={{margin:'0 0 8px',fontSize:'10px',fontWeight:'900',color:'#e879f9',textTransform:'uppercase',letterSpacing:'2px'}}>Choose Problem</p>
              {loadingProblems
                ? <p style={{margin:0,fontSize:'12px',color:'#7c3aed'}}>Loading…</p>
                : <select onChange={e=>handleProblemSelect(e.target.value)} style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid rgba(139,92,246,0.5)',background:'rgba(76,29,149,0.5)',color:'white',fontSize:'13px',outline:'none'}}>
                    <option value="">Select a problem</option>
                    {problems.map(p=><option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
              }
            </div>
          )}

          <div style={{background:'linear-gradient(to right,#6d28d9,#a21caf,#7c3aed)',padding:'16px',borderRadius:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid rgba(232,121,249,0.4)',flexShrink:0,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,opacity:0.1,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'16px 16px'}}/>
            <div style={{position:'relative'}}>
              <p style={{margin:'0 0 2px',fontSize:'10px',fontWeight:'900',color:'#e9d5ff',textTransform:'uppercase',letterSpacing:'2px'}}>Room ID</p>
              <p style={{margin:0,fontSize:'20px',fontWeight:'900',color:'white',letterSpacing:'3px',fontFamily:'monospace'}}>{roomId}</p>
            </div>
            <button onClick={handleCopy} style={{position:'relative',background:'rgba(255,255,255,0.2)',border:'none',padding:'8px',borderRadius:'10px',cursor:'pointer'}}>
              {copySuccess ? <span style={{color:'white',fontSize:'11px',fontWeight:'700',padding:'0 4px'}}>✓ Copied!</span> : <img style={{width:'20px',height:'20px'}} src="/copy.png" alt="copy"/>}
            </button>
          </div>

          {streamActive && (
            <div style={{background:'rgba(127,29,29,0.4)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:'10px',padding:'8px 12px',display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
              <div style={{width:'10px',height:'10px',background:'#ef4444',borderRadius:'50%'}}/>
              <p style={{margin:0,fontSize:'10px',fontWeight:'900',color:'#fca5a5',textTransform:'uppercase',letterSpacing:'1px'}}>🔴 LIVE — Broadcasting</p>
            </div>
          )}

          {/* ── CAMERA GRID: Host + Participants ── */}
          <div style={{background:'rgba(46,16,101,0.5)',border:'1px solid rgba(139,92,246,0.4)',borderRadius:'14px',padding:'10px',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{fontSize:'10px',fontWeight:'900',color:'#e879f9',textTransform:'uppercase',letterSpacing:'2px'}}>📹 Cameras</span>
                <span style={{fontSize:'9px',fontWeight:'700',padding:'2px 6px',borderRadius:'8px',background:'rgba(109,40,217,0.4)',border:'1px solid rgba(139,92,246,0.4)',color:'#d8b4fe'}}>{participants.length+1} live</span>
              </div>
              <button onClick={startScreenShare} style={{padding:'4px 8px',background:'#2563eb',color:'white',fontSize:'9px',fontWeight:'800',borderRadius:'8px',border:'none',cursor:'pointer'}}>💻 Share Screen</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
              {/* Host tile — live camera */}
              <div style={{position:'relative',borderRadius:'10px',overflow:'hidden',background:'rgba(20,5,50,0.85)',border:'2px solid rgba(139,92,246,0.5)',aspectRatio:'4/3'}}>
                {isVideoOn && myStream ? (
                  <video ref={selfVideoRef} autoPlay muted playsInline
                    style={{width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)'}}/>
                ) : (
                  <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px'}}>
                    <span style={{fontSize:'20px',opacity:0.4}}>📷</span>
                    <span style={{fontSize:'9px',color:'#7c3aed'}}>Cam Off</span>
                  </div>
                )}
                <div style={{position:'absolute',bottom:'4px',left:'4px',right:'4px',background:'rgba(0,0,0,0.7)',borderRadius:'6px',padding:'2px 5px',display:'flex',alignItems:'center',gap:'4px'}}>
                  <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#4ade80',flexShrink:0}}/>
                  <span style={{fontSize:'9px',color:'white',fontWeight:'700',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{localUser?.username ? localUser.username + (privilege ? ' (Host - You)' : ' (You)') : 'You'}</span>
                </div>
              </div>
              {/* Participant tiles */}
              {participants.map((p,i) => (
                <ParticipantVideo key={p.id||i} stream={remoteStreams?.[p.id]} user={p.user} isHost={p.id === hostSocketId} />
              ))}
            </div>
          </div>

          {privilege ? (
            <div style={{background:'rgba(46,16,101,0.55)',border:'1px solid rgba(139,92,246,0.4)',borderRadius:'16px',display:'flex',flexDirection:'column',flex:1,minHeight:0,overflow:'hidden'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px 12px',borderBottom:'1px solid rgba(139,92,246,0.3)',flexShrink:0}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{fontSize:'16px'}}>🔔</span>
                  <p style={{margin:0,fontSize:'10px',fontWeight:'900',color:'#f5d0fe',textTransform:'uppercase',letterSpacing:'2px'}}>Join Requests</p>
                </div>
                <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                  {participants.length>0 && <span style={{fontSize:'10px',fontWeight:'700',padding:'2px 8px',borderRadius:'12px',background:'rgba(21,128,61,0.25)',border:'1px solid rgba(74,222,128,0.4)',color:'#86efac'}}>{participants.length} in room</span>}
                  {requestUsername.length>0 && <span style={{fontSize:'11px',fontWeight:'900',padding:'2px 8px',borderRadius:'12px',background:'#eab308',color:'black'}}>{requestUsername.length}</span>}
                </div>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'12px'}}>
                {requestUsername.length>0 ? (
                  <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    {requestUsername.map((x,i)=>(
                      <div key={x.joinerSocketId||i} style={{background:'rgba(78,32,0,0.5)',border:'1px solid rgba(234,179,8,0.35)',borderRadius:'12px',padding:'12px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                          <img style={{height:'36px',width:'36px',borderRadius:'50%',border:'2px solid rgba(234,179,8,0.6)',flexShrink:0}} src={x.user?.avatar||'/default-avatar.png'} alt={x.user?.username}/>
                          <div style={{flex:1,minWidth:0}}>
                            <p style={{margin:0,fontSize:'13px',color:'white',fontWeight:'700',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{x.user?.username}</p>
                            <p style={{margin:0,fontSize:'10px',color:x.streamStarted?'#fca5a5':'#fbbf24',fontWeight:'600'}}>{x.streamStarted?'🔴 Joining live stream':'Requesting to join…'}</p>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:'8px'}}>
                          <button onClick={()=>acceptRequest(i)} style={{flex:1,padding:'8px',background:'#16a34a',color:'white',fontWeight:'900',borderRadius:'10px',fontSize:'12px',border:'none',cursor:'pointer'}}>✓ Accept</button>
                          <button onClick={()=>denyRequest(i)} style={{flex:1,padding:'8px',background:'#b91c1c',color:'white',fontWeight:'900',borderRadius:'10px',fontSize:'12px',border:'none',cursor:'pointer'}}>✕ Deny</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',textAlign:'center',gap:'16px'}}>
                    <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'rgba(88,28,135,0.4)',border:'1px solid rgba(139,92,246,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>🔔</div>
                    <div>
                      <p style={{margin:0,fontSize:'13px',fontWeight:'700',color:'#c084fc'}}>No pending requests</p>
                      <p style={{margin:'4px 0 0',fontSize:'11px',color:'#7c3aed'}}>Requests appear here instantly</p>
                    </div>
                    <div style={{padding:'8px 16px',background:'rgba(88,28,135,0.3)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:'10px'}}>
                      <p style={{margin:0,fontSize:'10px',color:'#a78bfa',fontFamily:'monospace',textAlign:'center'}}>Share: {roomId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{background:'rgba(46,16,101,0.45)',border:'1px solid rgba(139,92,246,0.35)',borderRadius:'16px',padding:'24px',flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#a21caf)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px'}}>✓</div>
              <div style={{textAlign:'center'}}>
                <p style={{margin:0,fontSize:'13px',fontWeight:'900',color:'#4ade80'}}>Connected!</p>
                <p style={{margin:'4px 0 0',fontSize:'11px',color:'#c084fc'}}>You are in the group session</p>
              </div>
              <div style={{padding:'8px 16px',background:'rgba(88,28,135,0.3)',border:'1px solid rgba(139,92,246,0.4)',borderRadius:'10px'}}>
                <p style={{margin:0,fontSize:'10px',color:'#c084fc',fontFamily:'monospace'}}>Room: {roomId}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
