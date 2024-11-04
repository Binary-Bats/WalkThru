import React from 'react'
import CodeImage from "../../assets/code.png"
import Button from '../Buttons/Button'

type Props = {
    handleClose: () => void
    handleAddToDocs: () => void
}

const AddSnippet = ({ handleAddToDocs, handleClose }: Props) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <div className='w-[70%]'>
                <img src={window.image} className='w-full' alt='image' />
                <div className='flex  gap-3 mt-3 justify-center'>
                    <button onClick={handleClose} type="button" className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2  dark:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-blue-800"> Cancel </button>
                    <button onClick={handleAddToDocs} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"> Add to Docs</button>
                </div>
            </div>

        </div>
    )
}

export default AddSnippet