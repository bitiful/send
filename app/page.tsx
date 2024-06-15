'use client'

import {useEffect, useRef, useState} from "react";
import Image from 'next/image'
import copy from "copy-to-clipboard"
import {CircularProgressbar, buildStyles} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const API_URL = 'http://localhost:1998'

export default function Home() {
    const [file, setFile] = useState<File | null>(null)
    const [prisignedGetUrl, setPrisignedGetUrl] = useState("")
    const [process, setProcess] = useState(0)
    const [tip, setTip] = useState("")

    function generateRandomString() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 10; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    function upload(url: string, file: File, onProgress: (event: ProgressEvent<EventTarget>) => void) {
        return new Promise((res, rej) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', url);

            xhr.onload = e => {
                res("")
            };
            xhr.onerror = rej;
            if (xhr.upload && onProgress)
                xhr.upload.onprogress = onProgress;
            xhr.send(file);
        });
    }

    useEffect(() => {
        if (file === null) return
        const uploadFile = async (file: File) => {
            const fileName = `${file.name}`.replaceAll(
                /[^a-zA-Z0-9.]/g,
                "-"
            );
            const now = new Date()
            const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}`
            const objectKey = date + "-" + generateRandomString() + "-" + fileName
            const requestUrl = `${API_URL}/presigned-url?key=${objectKey}&content-length=${file.size}&no-wait=5&max-requests=2&expire=1800&limit-rate=5242880&force-download=true`
            const response = await fetch(requestUrl)
            if (!response.ok) {
                console.log("error", response.status)
                return
            }

            // 获取一个签名的put-url和get-url
            const result = await response.json()
            const presignedGetUrl = result['get-url']
            const presignedPutUrl = result['put-url']
            setPrisignedGetUrl(presignedGetUrl)

            await upload(presignedPutUrl, file, function (event) {
                if (event.lengthComputable) {
                    setProcess(event.loaded / event.total * 100)
                }
            })
        }
        uploadFile(file).then(() => {
            console.log("upload file success")
            setProcess(100)
        }).catch((e) => {
            console.log("upload file error", e)
            setProcess(0)
        })
    }, [file])

    return (
        <div
            className="flex h-screen min-h-[1000px] bg-[#181818] items-center justify-center select-none">
            <div className='relative flex items-center justify-center shrink-0'>
                <div
                    className='bg-white w-96 h-[700px] rounded-xl p-4'>
                    <div className='flex justify-between items-center h-10'>
                        <svg width="22" height="22" aria-hidden="true" viewBox="0 0 16 16" version="1.1"
                             data-view-component="true" className='invisible'>
                            <path
                                d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                        </svg>

                        <svg width="120" height="30" viewBox="0 0 811 204" fill="none"
                             xmlns="http://www.w3.org/2000/svg" onClick={() => {
                            window.open("https://www.bitiful.com")
                        }} className='cursor-pointer'>
                            <path
                                d="M684.76 100.12V113.8H661.48V161.32H647.08V113.8H617.32C616.84 121.64 615.76 128.2 614.08 133.48C612.48 138.68 609.92 143.56 606.4 148.12C602.88 152.6 597.8 157.76 591.16 163.6L580 152.8C585.92 148.16 590.4 144.04 593.44 140.44C596.56 136.76 598.8 132.92 600.16 128.92C601.6 124.84 602.48 119.8 602.8 113.8H577.48V100.12H603.16V71.32H582.76V58H680.2V71.32H661.48V100.12H684.76ZM617.68 100.12H647.08V71.32H617.68V99.16V100.12ZM718.6 79.84C715.32 76.64 709 71.16 699.64 63.4L706.96 53.8C714.24 59.4 720.64 64.44 726.16 68.92L718.6 79.84ZM799 126.16H778.96V147.88C778.96 151.48 778.52 154.24 777.64 156.16C776.84 158.16 775.48 159.56 773.56 160.36C771.64 161.24 768.88 161.68 765.28 161.68H755.2L752.8 149.8H760.36C763 149.8 764.72 149.36 765.52 148.48C766.4 147.52 766.84 145.6 766.84 142.72V126.16H746.8V79.12H761.08C762.44 74.4 763.36 71.04 763.84 69.04H739.84V98.56C739.84 108.96 739.48 117.68 738.76 124.72C738.12 131.68 736.92 138.2 735.16 144.28C733.4 150.28 730.84 156.6 727.48 163.24L715.24 157.84C718.68 151.12 721.24 145 722.92 139.48C724.6 133.88 725.76 128.04 726.4 121.96C727.04 115.8 727.36 108.12 727.36 98.92V56.92H804.76V69.04H777.16C777.24 68.8 776.92 70 776.2 72.64C775 76.72 774.36 78.88 774.28 79.12H799V126.16ZM716.68 107.92C714.04 105.52 710.76 102.68 706.84 99.4C702.92 96.04 699.4 93.08 696.28 90.52L703.36 80.44L716.2 90.64L724.6 97.36L716.68 107.92ZM786.88 97.96V90.16H758.92V97.96H786.88ZM786.88 107.2H758.92V115.36H786.88V107.2ZM720.88 118C719.6 123.36 717.84 130.6 715.6 139.72C713.36 148.84 711.6 156.12 710.32 161.56L698.32 158.08C699.76 152.72 701.72 144.88 704.2 134.56C706.76 124.24 708.28 117.72 708.76 115L720.88 118ZM760.84 134.56C758.52 138.72 755.84 143.04 752.8 147.52C749.76 151.92 746.76 155.88 743.8 159.4L734.8 152.08C741.52 144.64 746.96 136.88 751.12 128.8L760.84 134.56ZM789.76 129.52C792.48 132.88 795.4 136.72 798.52 141.04C801.72 145.36 804.32 148.96 806.32 151.84L796.48 158.8C794.48 155.52 791.88 151.56 788.68 146.92C785.56 142.2 782.88 138.48 780.64 135.76L789.76 129.52Z"
                                fill="#898989"/>
                            <path
                                d="M66.667 164.793C62.6463 164.793 58.843 164.25 55.257 163.163C51.671 162.185 48.4653 160.827 45.64 159.088C42.8147 157.241 40.4783 155.122 38.631 152.731C36.7837 150.34 35.5883 147.787 35.045 145.07L41.239 143.44L39.12 162.837H11.41V42.38H41.891V97.148L35.371 95.029C36.023 92.095 37.2727 89.3783 39.12 86.879C41.076 84.3797 43.4123 82.2063 46.129 80.359C48.8457 78.403 51.8883 76.936 55.257 75.958C58.6257 74.8713 62.1573 74.328 65.852 74.328C73.35 74.328 79.9243 76.284 85.575 80.196C91.3343 83.9993 95.844 89.324 99.104 96.17C102.473 103.016 104.157 110.84 104.157 119.642C104.157 128.444 102.527 136.268 99.267 143.114C96.007 149.851 91.5517 155.176 85.901 159.088C80.2503 162.891 73.839 164.793 66.667 164.793ZM57.865 139.854C61.3423 139.854 64.2763 139.039 66.667 137.409C69.1663 135.67 71.068 133.334 72.372 130.4C73.7847 127.357 74.491 123.771 74.491 119.642C74.491 115.404 73.839 111.764 72.535 108.721C71.231 105.678 69.3293 103.396 66.83 101.875C64.3307 100.245 61.3423 99.43 57.865 99.43C54.3877 99.43 51.3993 100.245 48.9 101.875C46.4007 103.396 44.4447 105.678 43.032 108.721C41.728 111.764 41.076 115.404 41.076 119.642C41.076 123.771 41.728 127.357 43.032 130.4C44.4447 133.334 46.4007 135.67 48.9 137.409C51.3993 139.039 54.3877 139.854 57.865 139.854ZM121.744 163V76.121H152.062V163H121.744ZM136.903 59.658C131.361 59.658 127.069 58.4083 124.026 55.909C120.984 53.301 119.462 49.6607 119.462 44.988C119.462 40.6413 120.984 37.1097 124.026 34.393C127.178 31.5677 131.47 30.155 136.903 30.155C142.337 30.155 146.575 31.459 149.617 34.067C152.769 36.5663 154.344 40.2067 154.344 44.988C154.344 49.3347 152.769 52.8663 149.617 55.583C146.466 58.2997 142.228 59.658 136.903 59.658ZM181.548 163V54.116H211.866V163H181.548ZM167.204 101.875V76.121H227.025V101.875H167.204ZM242.88 163V76.121H273.198V163H242.88ZM258.039 59.658C252.497 59.658 248.205 58.4083 245.162 55.909C242.12 53.301 240.598 49.6607 240.598 44.988C240.598 40.6413 242.12 37.1097 245.162 34.393C248.314 31.5677 252.606 30.155 258.039 30.155C263.473 30.155 267.711 31.459 270.753 34.067C273.905 36.5663 275.48 40.2067 275.48 44.988C275.48 49.3347 273.905 52.8663 270.753 55.583C267.602 58.2997 263.364 59.658 258.039 59.658ZM300.727 163V74.165C300.727 68.1883 302.031 62.755 304.639 57.865C307.247 52.975 310.888 49.063 315.56 46.129C320.233 43.195 325.666 41.728 331.86 41.728C336.207 41.728 340.173 42.3257 343.759 43.521C347.454 44.7163 350.877 46.4007 354.028 48.574L345.878 70.253C344.466 69.8183 343.162 69.4923 341.966 69.275C340.771 68.949 339.739 68.786 338.869 68.786C337.022 68.786 335.501 69.112 334.305 69.764C333.219 70.416 332.404 71.394 331.86 72.698C331.426 74.002 331.208 75.5777 331.208 77.425V163H316.049C312.355 163 309.203 163 306.595 163C304.096 163 302.14 163 300.727 163ZM288.502 103.179V78.892H347.834V103.179H288.502ZM390.309 164.793C383.789 164.793 378.247 163.435 373.683 160.718C369.119 157.893 365.641 153.872 363.251 148.656C360.86 143.44 359.665 137.137 359.665 129.748V76.121H389.983V126.651C389.983 129.476 390.472 131.867 391.45 133.823C392.428 135.779 393.786 137.3 395.525 138.387C397.263 139.365 399.382 139.854 401.882 139.854C403.838 139.854 405.576 139.582 407.098 139.039C408.728 138.496 410.086 137.681 411.173 136.594C412.259 135.399 413.129 134.095 413.781 132.682C414.433 131.161 414.759 129.531 414.759 127.792V76.121H445.077V163H417.041L415.411 145.396L421.116 143.44C419.92 147.461 417.801 151.101 414.759 154.361C411.716 157.621 408.076 160.175 403.838 162.022C399.6 163.869 395.09 164.793 390.309 164.793ZM468.419 163V42.38H498.737V163H468.419Z"
                                fill="black"/>
                            <path
                                d="M158 42.5C158 54.3741 148.374 64 136.5 64C124.626 64 115 54.3741 115 42.5C115 30.6259 124.626 21 136.5 21C148.374 21 158 30.6259 158 42.5Z"
                                fill="#00E9E9"/>
                            <circle cx="257.5" cy="42.5" r="21.5" fill="#00DD66"/>
                        </svg>

                        <svg width="22" height="22" aria-hidden="true" viewBox="0 0 16 16" version="1.1"
                             data-view-component="true" className='cursor-pointer' onClick={() => {
                            window.open("https://github.com/bitiful/biti-transfer")
                        }}>
                            <path
                                d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                        </svg>
                    </div>

                    {file === null && <div onDrop={(event) => {
                        event.preventDefault()
                        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                            if (event.dataTransfer.files[0].size > 1024 * 1024 * 1024) {
                                setTip("文件最大1GB")
                                setTimeout(() => {
                                    setTip("")
                                }, 1000)
                                return
                            }

                            setFile(event.dataTransfer.files[0])
                        }
                    }} onDragOver={(e) => e.preventDefault()}>
                        <label className='h-[500px] flex items-center justify-center cursor-pointer'
                               htmlFor='uploadFiles'>
                            <div className='text-black flex items-center gap-2'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0070E8"
                                     className="size-10">
                                    <path fillRule="evenodd"
                                          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                                          clipRule="evenodd"/>
                                </svg>
                                <div>
                                    <div className='font-medium text-xl'>上传文件</div>
                                    <div className='text-[12px] text-[#666]'>或者拖拽文件到这里</div>
                                </div>
                            </div>
                        </label>
                        <input type="file" id="uploadFiles" name="files" className='hidden' onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                if (e.target.files[0].size > 1024 * 1024 * 1024) {
                                    setTip("文件最大1GB")
                                    setTimeout(() => {
                                        setTip("")
                                    }, 1000)
                                    return
                                }
                                setFile(e.target.files[0])
                            }
                        }}/>
                    </div>}

                    {file !== null && <div className='h-[500px] flex flex-col'>
                        <div className='relative flex justify-center mt-14'>
                            <div className='w-52 h-52'>
                                <CircularProgressbar
                                    value={process}
                                    text={`${process.toFixed(0)}%`}
                                    strokeWidth={10}
                                    styles={buildStyles({
                                        textColor: "black",
                                        pathColor: "#27FE89",
                                        trailColor: "#ccc"
                                    })}
                                />
                                <div
                                    className='w-52 text-[#666] text-sm text-center absolute top-32'>{process >= 100 ? "上传完成" : "正在上传"}</div>
                            </div>
                        </div>

                        <div>
                            <div className='mt-20'>
                                <div className='text-orange-400 text-sm flex flex-col text-center font-semibold gap-2'>
                                    <div>利用 <span
                                        className='font-extrabold'>Simul-Transfer</span> 技术
                                    </div>
                                    <div>
                                        文件上传中即可开始下载 ，快来试试吧!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}

                    <div
                        className={`${tip !== "" ? "visible" : "invisible"}` + " mx-auto h-7 size-fit text-white bg-black px-3 py-[6px] text-xs rounded-full"}>
                        {tip}
                    </div>

                    <div>
                        <div className='flex justify-center gap-4 mb-2 mt-4'>
                            <div className='text-xs text-[#333] font-bold'>最大下载次数: 2次</div>
                            <div className='text-xs text-[#333] font-bold'>过期时间: 30分钟</div>
                            <div className='text-xs text-[#333] font-bold'>下载限速: 5 MiB/s</div>

                        </div>

                        <div
                            className={`${prisignedGetUrl === "" ? "bg-[#ccc]" : "bg-[#0070E8] cursor-pointer hover:bg-[#0070E8dd]"}` + " h-12 w-full content-center text-center rounded-lg flex items-center justify-center gap-2"}
                            onClick={() => {
                                if (prisignedGetUrl !== "") {
                                    copy(prisignedGetUrl)
                                    setTip("复制成功")
                                    setTimeout(() => {
                                        setTip("")
                                    }, 1000)
                                }
                            }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"/>
                            </svg>
                            <span>复制链接, 可立即下载</span>
                        </div>
                    </div>
                </div>

                <div
                    className='h-[700px] w-[600px] content-center ml-28 pointer-events-none cursor-default'>
                    <Image
                        src="desc.svg"
                        width={600}
                        height={600}
                        alt="icon"
                    />
                </div>

                <div className='absolute -top-44 -left-48 pointer-events-none cursor-default'>
                    <Image
                        src="stars.svg"
                        width={160}
                        height={160}
                        alt="icon"
                    />
                </div>

                <div className='absolute -bottom-40 -left-44 pointer-events-none cursor-default'>
                    <Image
                        src="fast.svg"
                        width={160}
                        height={160}
                        alt="icon"
                    />
                </div>

                <div className='absolute -top-10 -right-12 pointer-events-none cursor-default'>
                    <Image
                        src="top.svg"
                        width={160}
                        height={160}
                        alt="icon"
                    />
                </div>
                <div className='absolute -bottom-10 -right-24 pointer-events-none cursor-default'>
                    <Image
                        src="five.svg"
                        width={160}
                        height={160}
                        alt="icon"
                    />
                </div>
            </div>
        </div>
    );
}
