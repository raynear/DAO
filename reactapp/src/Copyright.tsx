import React from 'react';
import { Typography, Link } from '@material-ui/core';
//import { Telegram, Twitter } from 'react-share-icons';
import Telegram from 'react-share-icons/lib/Telegram';
import Twitter from 'react-share-icons/lib/Twitter';

function Copyright() {
    return (
        <>
            <Typography variant="body2" color="textSecondary" align="center">
                {'Copyright © '}
                <Link color="inherit" href="https://icon.vote/">
                    ICON.Vote{' '}
                </Link>
                {new Date().getFullYear()}
                {'.'}
                <a href="https://t.me/iconvote" target="_blank"><Telegram width={30} /></a>
                <a href="https://twitter.com/ICONvote" target="_blank"><Twitter width={30} /></a>
            </Typography>
        </>
    );
}


export default Copyright;