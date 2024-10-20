import Image from "next/image";
import FileUpload from "./components/fileUpload";
import FileDownload from "./components/fileDownload";

export default function Home() {
  return (
    <div className=" mt-4 items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
     <FileUpload/>
        {/* <FileDownload/> */}
    </div>
  );
}
