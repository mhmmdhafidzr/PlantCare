"use client"
import { ChangeEvent, DragEvent, useRef, useState } from "react"
import Image from "next/image"
import * as tf from "@tensorflow/tfjs"
import { Charm } from "next/font/google"

import classes from "@/disease/classes"

const font = Charm({
  subsets: ['latin'],
  weight: "700",
})

export default function Home() {
  const [result, setResult] = useState<number | null>(null)
  const [dragFile, setDragFile] = useState<boolean>(false)
  const [imgBlob, setImageBlob] = useState<string | null>(null)
  const inputImage = useRef<HTMLInputElement>(null)


  async function loadImage(blob: string) {
    const imgPromise: HTMLImageElement = await new Promise((resolve, reject) => {
      const image = document.createElement("img")
      image.src = blob
      image.crossOrigin = "anonymous"
      image.onload = () => resolve(image)
      image.onerror = (error) => reject(error)
    })
    return tf.browser.fromPixels(imgPromise)
  }

  async function predict(imageUrl: string) {
    const disease = await tf.loadLayersModel("/tensorflow/model.json")
    const image3d = await loadImage(imageUrl)
    const tfImage = tf.image.resizeBilinear(image3d, [224, 224]).div(255.0).expandDims()

    const diseasePredict = await (disease.predict(tfImage) as tf.Tensor).data()
    const maxPrediction = Math.max(...diseasePredict)
    const predixtionIndex = diseasePredict.indexOf(maxPrediction)
    setResult(predixtionIndex)
  }

  function handleDragInput(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type == "dragenter" || e.type == "dragover") {
      setDragFile(true)
    } else if (e.type == "dragleave") {
      setDragFile(false)
    }
  }

  async function handleDropInput(e: DragEvent<HTMLDivElement>) {
    setDragFile(false)
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const imgaeUrl = blobImage(e.dataTransfer.files[0])
      await predict(imgaeUrl)
    }
  }

  async function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const imgaeUrl = blobImage(e.target.files[0])
      await predict(imgaeUrl)
    }
  }

  function blobImage(imgObj: Blob | MediaSource) {
    const url = URL.createObjectURL(imgObj)
    setImageBlob(url)
    return url
  }

  function clearResult() {
    setResult(null)
    setImageBlob(null)
  }

  return (
    <>
      <div className="flex justify-center items-center min-h-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-center gap-x-3 px-4 py-3.5 w-full">
          <div className="flex flex-col justify-center w-full md:w-8/12">
            <div className="flex justify-center md:justify-normal items-center gap-1.5 mb-4 w-full">
              <Image src="/assets/images/plantcare-icon.png" alt="Plant Care Icon" width={64} height={64} className="w-14 h-14" />
              <div className={`${font.className} font-bold text-white text-[42px]`}>
                PlantCare
              </div>
            </div>
            {
              imgBlob ?
                <div className="text-white flex flex-col md:flex-row justify-center md:justify-start items-start gap-2.5 mb-3 w-full">
                  <Image src={imgBlob} alt="imgBlob" width={256} height={0} className="max-w-[128px] rounded h-auto mx-auto mb-3.5 md:mx-0" unoptimized />
                  <div className="w-full">
                    <div className="flex items-start mb-2 w-full">
                      <div className="font-semibold text-xl -mt-1">
                        {result ? classes[result].name : "Getting information about disease..."}
                      </div>
                      {
                        result &&
                        <button className="bg-red-600 font-medium ml-auto px-2 py-1.5 rounded" onClick={() => clearResult()}>
                          Hapus
                        </button>
                      }
                    </div>
                    {
                      result &&
                      <>
                        {classes[result].article}
                      </>
                    }
                  </div>
                </div>
                :
                <>

                  <div className="text-white text-center md:text-left mb-5">
                    <div className="font-bold text-3xl mb-2">
                      Selamat Datang di PlantCare
                    </div>
                    <div className="text-lg">
                      PlantCare adalah website yang bisa membantu kamu untuk mendeteksi penyakit tanaman dan mendapatkan informasi bermanfaat tentang cara penanganannya.
                    </div>
                  </div>
                  <div className="relative flex flex-col w-full" onDragEnter={(e) => handleDragInput(e)}>
                    <input type="file" accept="image/*" id="inputFile" ref={inputImage} className="hidden" onChange={(e) => handleInputChange(e)} />
                    <label htmlFor="inputFile" className="bg-[#69bf27] border-[3px] border-dashed border-green-600 font-medium w-full text-center px-3 py-9 rounded-lg text-white cursor-pointer">
                      <div className="flex items-center gap-1 w-full">
                        <div className="text-lg">
                          Drag & drop image here
                        </div>
                        <div className="bg-green-600 w-fit ml-auto px-2 py-1.5 rounded">
                          Upload image
                        </div>
                      </div>
                    </label>
                    {
                      dragFile &&
                      <div className="absolute top-0 w-full h-[202px]" onDragEnter={(e) => handleDragInput(e)} onDragLeave={(e) => handleDragInput(e)} onDragOver={(e) => handleDragInput(e)} onDrop={(e) => handleDropInput(e)}></div>
                    }
                  </div>
                </>
            }
          </div>
          <div className="hidden md:flex w-full md:w-4/12">
            <Image src="/assets/images/plantcare-bg.png" alt="plantcare" height={500} width={500} className="w-auto h-auto my-auto" unoptimized />
          </div>
        </div>
      </div>
    </>
  )
}
