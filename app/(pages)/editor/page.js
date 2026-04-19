"use client";

import EditorBox from "../../../Components/EditorComponents/EditorBox";
import ExampleCasesOutput from "../../../components/ExampleCasesOutput";
import Executing from "../../../components/Executing";
import LoginToCode from "../../../components/LoginToCode";
import SampleCases from "../../../components/SampleCases";
import SubmissionResult from "../../../components/SubmissionResult";

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-gray-800 p-6 text-white">
      <EditorBox />
      <ExampleCasesOutput />
      <Executing />
      <LoginToCode />
      <SampleCases />
      <SubmissionResult />
    </div>
  );
}