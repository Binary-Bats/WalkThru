import React, { useState, useEffect } from 'react';
import FileExplorer from './FileExplorer'; // Assuming this is your existing File Explorer component
import { TreeNode } from '../../Types/types';
import vscode from '../../utils/VscodeSendMessage';
import filterFileStructure from './FilterData';
import Token from './Token';

type Snippet = {
    path: string,
    line_start: number,
    text: string
    line_end: number
}
type Path = {
    contextValue: string,
    label: string,
    path: string

}

type Props = {
    handleClose: () => void
    id?: string
}


const TokenModel = ({ handleClose, id }: Props) => {

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">

            <Token handleClose={handleClose} id={id} />
        </div>
    );
};

export default TokenModel;