'use client';
import dynamic from 'next/dynamic';
import Timer from './Timer.jsx';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
const Executing = dynamic(() => import('../EditorComponent/Executing.jsx'), { ssr: false });
const ExampleCasesOutput = dynamic(() => import('../EditorComponent/ExampleCasesOutput.jsx'), { ssr: false });

export default function InterviewRoom({
  roomId, privilege, connectionReady, remoteUser, remoteStream, myStream, localUser,
  cases, executing, exampleCasesExecution, language, theme, code,
  isAudioOn, isVideoOn, showQuestion, question, problems, loadingProblems,
  copySuccess, requestUsername, show_share_streams, remoteSocketId, setTheme,
  setAudioOn, setVideoOn, setExampleCasesExecution, setShowQuestion,
  exitRoom, handleCopy, acceptRequest, denyRequest, sendStreams,
  handleLanguageChange, handleProblemSelect, handleInputChange,
  changeCode, changeQuestion, clickRun,
}) {
  return (
    <div className="h-screen p-4 flex text-white overflow-hidden relative bg-gradient-to-br from-gray-900 via-blue-950 to-black">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-indigo-500/5"/>

      <div className="relative z-10 w-full h-full flex gap-4">

        {/* ── LEFT PANEL — Test Cases / Results ── */}
        <div className="bg-gray-900/90 border border-gray-700/60 p-4 rounded-2xl w-[22%] flex flex-col h-full shadow-2xl">
          <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">

            {/* Media Controls */}
            <div className="flex items-center justify-evenly bg-gray-800/70 p-3 rounded-xl border border-gray-700/50">
              <button title="Leave" onClick={exitRoom}
                className="bg-red-600 hover:bg-red-700 p-2.5 rounded-lg shadow transition hover:scale-105">
                <img className="h-5 w-5" src="/endcall.png" alt="end"/>
              </button>
              <button title={isAudioOn?'Mute':'Unmute'}
                onClick={()=>{if(myStream){const t=myStream.getAudioTracks()[0];if(t){t.enabled=!t.enabled;setAudioOn(t.enabled);}}}}
                className={`p-2.5 rounded-lg shadow transition hover:scale-105 ${isAudioOn?'bg-gray-700 hover:bg-gray-600':'bg-red-600 hover:bg-red-700'}`}>
                <img className="h-5 w-5" src={isAudioOn?'/micon.png':'/micoff.png'} alt="mic"/>
              </button>
              <button title={isVideoOn?'Camera Off':'Camera On'}
                onClick={()=>{if(myStream){const t=myStream.getVideoTracks()[0];if(t){t.enabled=!t.enabled;setVideoOn(t.enabled);}}}}
                className={`p-2.5 rounded-lg shadow transition hover:scale-105 ${isVideoOn?'bg-gray-700 hover:bg-gray-600':'bg-red-600 hover:bg-red-700'}`}>
                <img className="h-5 w-5" src={isVideoOn?'/camera-on.png':'/camera-off.png'} alt="cam"/>
              </button>
            </div>

            {/* Mode Badge */}
            <div className="text-center py-1.5 px-3 rounded-lg text-xs font-bold tracking-widest border bg-blue-900/40 border-blue-600/50 text-blue-300">
              🎯 1-ON-1 INTERVIEW
            </div>

            {/* Test Cases */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              <h3 className="text-sm font-extrabold text-center uppercase tracking-widest bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Test Cases
              </h3>
              {executing ? (
                <div className="flex items-center gap-3 bg-blue-600/20 border border-blue-500/40 rounded-xl p-3 animate-pulse">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0"/>
                  <Executing text="Executing…"/>
                </div>
              ) : exampleCasesExecution ? (
                <div className="flex flex-col gap-3 overflow-y-auto flex-1">
                  <ExampleCasesOutput exampleCasesExecution={exampleCasesExecution}/>
                  <button className="w-full px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition flex-shrink-0"
                    onClick={()=>setExampleCasesExecution(null)}>🔄 Reset</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                  {cases.map((c,i)=>(
                    <div key={c.id} className="bg-gray-800/60 border border-gray-700/50 p-3 rounded-xl space-y-2">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Input</label>
                        <input type="text" value={c.input} readOnly={!privilege} onChange={e=>handleInputChange(i,'input',e.target.value)}
                          className="w-full p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-xs font-mono"/>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Expected</label>
                        <input type="text" value={c.output} readOnly={!privilege} onChange={e=>handleInputChange(i,'output',e.target.value)}
                          className="w-full p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-xs font-mono"/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="bg-gray-800/60 border border-gray-700/50 p-2 rounded-xl flex-shrink-0">
              <Timer previlige={privilege} remoteSocketId={remoteSocketId} roomId={roomId} isGroupMode={false}/>
            </div>
          </div>
        </div>

        {/* ── CENTER PANEL — Code Editor ── */}
        <div className="bg-gray-900/90 border border-gray-700/60 rounded-2xl flex-1 shadow-2xl flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700/60 bg-gray-900/80 flex-shrink-0">
            <div className="flex gap-3">
              <button onClick={clickRun} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition hover:scale-105 text-sm">
                ▶ Run
              </button>
              <button onClick={()=>setShowQuestion(p=>!p)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition hover:scale-105 text-sm">
                📝 Question
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <select value={language} onChange={e=>handleLanguageChange(e.target.value)}
                className="p-2 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="cpp">C++</option><option value="c">C</option><option value="java">Java</option><option value="python">Python</option>
              </select>
              <select value={theme} onChange={e=>setTheme(e.target.value)}
                className="p-2 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="vs-dark">Dark</option><option value="light">Light</option><option value="hc-black">High Contrast</option>
              </select>
            </div>
          </div>

          {/* Question overlay */}
          {showQuestion && (
            <div className="absolute z-20 top-16 left-[22%] right-[23%] max-h-[70vh] overflow-y-auto bg-white text-black rounded-xl shadow-2xl border border-gray-300 p-6">
              <div className="flex justify-between items-center mb-3">
                <strong className="text-lg">Question</strong>
                <button onClick={()=>setShowQuestion(false)} className="text-gray-500 hover:text-gray-800 text-xl font-bold">✕</button>
              </div>
              <hr className="border-2 border-slate-300 mb-3"/>
              {privilege
                ? <textarea value={question} onChange={changeQuestion} className="w-full h-64 p-3 border border-gray-400 rounded-md text-black resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                : <p className="whitespace-pre-wrap text-sm leading-relaxed">{question}</p>
              }
            </div>
          )}

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 p-3">
            <Editor height="100%" width="100%" language={language} value={code} theme={theme} onChange={changeCode}
              options={{fontSize:15,minimap:{enabled:false},scrollBeyondLastLine:false,automaticLayout:true,wordWrap:'on'}}
              className="rounded-xl overflow-hidden border border-gray-700/50"/>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-[23%] h-full flex flex-col gap-3">

          {/* Problem Selector (host only) */}
          {privilege && (
            <div className="bg-gray-900/90 border border-gray-700/60 p-4 rounded-2xl shadow-xl flex-shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Choose Problem</p>
              {loadingProblems
                ? <p className="text-gray-500 text-xs">Loading…</p>
                : <select onChange={e=>handleProblemSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-800 border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select a problem</option>
                    {problems.map(p=><option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
              }
            </div>
          )}

          {connectionReady ? (
            /* Connected — video feeds */
            <>
              <div className="bg-gray-900/90 border border-gray-700/60 rounded-2xl p-3 flex-shrink-0">
                <h3 className="text-xs font-semibold mb-2 text-center text-blue-300 uppercase tracking-widest">
                  {privilege ? (remoteUser?.username || 'Participant') : (remoteUser?.username ? remoteUser.username + ' (Host)' : 'Interviewer')}
                </h3>
                <div className="bg-gray-950 h-36 w-full rounded-xl overflow-hidden flex items-center justify-center border border-gray-700">
                  {remoteStream
                    ? <video ref={r=>{if(r)r.srcObject=remoteStream}} autoPlay playsInline className="h-full w-full object-cover"/>
                    : <div className="text-center text-gray-600"><div className="text-3xl mb-1">🎥</div><p className="text-xs">No stream</p></div>
                  }
                </div>
              </div>
              <div className="bg-gray-900/90 border border-gray-700/60 rounded-2xl p-3 flex-shrink-0">
                <h3 className="text-xs font-semibold mb-2 text-center text-green-300 uppercase tracking-widest">{localUser?.username ? localUser.username + (privilege ? ' (Host - You)' : ' (You)') : 'You'}</h3>
                <div className="bg-gray-950 h-36 w-full rounded-xl overflow-hidden flex items-center justify-center border border-gray-700">
                  {isVideoOn && myStream
                    ? <video ref={r=>{if(r)r.srcObject=myStream}} autoPlay muted playsInline className="h-full w-full object-cover"/>
                    : <div className="text-center text-gray-600"><div className="text-3xl mb-1">📹</div><p className="text-xs">Camera Off</p></div>
                  }
                </div>
              </div>
              {show_share_streams===1 && (
                <button onClick={sendStreams} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow text-sm transition hover:scale-105 flex-shrink-0">
                  📡 Share Stream
                </button>
              )}
            </>
          ) : (
            /* Waiting — room ID + join requests */
            <>
              <div className="bg-gradient-to-r from-green-700 to-emerald-700 p-4 rounded-2xl flex justify-between items-center shadow-xl border border-green-500/40 flex-shrink-0">
                <div>
                  <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest mb-0.5">Room ID</p>
                  <p className="text-2xl font-extrabold text-white tracking-widest font-mono">{roomId}</p>
                </div>
                <button onClick={handleCopy} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition">
                  {copySuccess ? <span className="text-green-100 text-xs font-bold px-1">✓ Copied!</span> : <img className="w-5 h-5" src="/copy.png" alt="copy"/>}
                </button>
              </div>

              <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl px-3 py-2 flex items-center gap-2 flex-shrink-0">
                <span className="text-lg">🎯</span>
                <div>
                  <p className="text-xs font-bold text-blue-200">1-on-1 Interview</p>
                  <p className="text-[10px] text-blue-400">One participant only</p>
                </div>
              </div>

              <div className="bg-gray-900/80 border border-gray-700/60 rounded-2xl p-4 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Join Requests</p>
                  {requestUsername.length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500 text-black animate-pulse">
                      {requestUsername.length}
                    </span>
                  )}
                </div>
                {requestUsername.length > 0 ? requestUsername.map((x,i)=>(
                  <div key={i} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700/40 p-3 rounded-xl mb-2">
                    <img className="h-9 w-9 rounded-full border-2 border-gray-600 flex-shrink-0"
                      src={x.user?.avatar||'/default-avatar.png'} alt={x.user?.username}/>
                    <p className="text-sm text-gray-200 font-medium flex-1 truncate">{x.user?.username}</p>
                    <button onClick={()=>acceptRequest(i)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs shadow transition hover:scale-105">✓</button>
                    <button onClick={()=>denyRequest(i)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow transition hover:scale-105">✕</button>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="animate-bounce text-3xl mb-2 opacity-40">👥</div>
                    <p className="text-gray-500 text-sm">No requests yet</p>
                    <p className="text-gray-600 text-[10px] mt-1">Waiting for participant…</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
