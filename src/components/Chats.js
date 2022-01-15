import React, { useRef,useState, useEffect} from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatEngine } from "react-chat-engine";
import { auth } from "../firebase";

import { useAuth } from "../contexts/AuthContext";


export default function Chats() {
    const didMountRef = useRef(false)
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const history = useHistory()
    
   
    async function handleLogout()  {
        await auth.signOut();

        history.push("/");
    }

    async function getFile(url) {
        let response = await fetch(url);
        let data = await response.blob();

        return new File ([data], "userPhoto.jpg", {type: "image/jpeg"});
    }

    useEffect(() => {
        if (!didMountRef.current){
            didMountRef.current = true
        }
        if(!user || user === null){
            history.push("/")

            return
        }

        axios.get( 
            'https://api.chatengine.io/users/me/', 
            { headers: {
                "project-id": "405195b9-4679-4b0f-87d3-93c07683b2cc",
                "user-name": user.email,
                "user-secret": user.uid
            }}
        
        )
        .then(() => {setLoading(false);

        })
        .catch(e => {
            let formdata = new FormData()
            formdata.append("email", user.email)
            formdata.append("username", user.email)
            formdata.append("secret", user.uid)

            getFile(user.photoURL)
                .then((avatar) => {
                    formdata.append("avatar", avatar, avatar.name)

                    axios.post('https://api.chatengine.io/users/',
                        formdata,
                        {headers: {"private-key":"3461357e-9de4-484b-bc7c-a8ac7e9f0222"}}
                    )

                    .then(() => setLoading(false))
                    .catch(e => console.log("e", e.response))
                })
        })

    }, [user, history]);

    if (!user || loading) return <div />

    return (
        <div className="chats-page">
            <div className="nav-bar">
                <div className="logo-tab">
                    Vaarta
                </div>

                <div onClick={handleLogout} className="logout-tab">
                    Logout
                </div>

            </div>

            <ChatEngine 
                height="calc(100vh - 66px)"
                projectID= "405195b9-4679-4b0f-87d3-93c07683b2cc"
                userName={user.email}
                userSecret={user.uid}
            />

        </div>
    )
}
