import React from 'react';
import { Typography, Link } from '@material-ui/core';
import { Twitter, Telegram } from '@material-ui/icons';

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
                <a href="https://t.me/iconvote" target="_blank" rel="noopener noreferrer"><Telegram width={30} style={{ color: "#50A8B8" }} /></a>
                <a href="https://twitter.com/ICONvote" target="_blank" rel="noopener noreferrer"><Twitter width={30} style={{ color: "#50A8B8" }} /></a>
            </Typography>
        </>
    );
}


export default Copyright;