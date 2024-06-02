import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorMessage, FormBase, FormInput, FormLabel, FormButton, ModalNotify } from "./shared.js";
import { validPassword, validUsername } from "../../shared/index.js";

export const Edit = () => {
    const { username } = useParams();
    console.log("Username:", username);

    const navigate = useNavigate();

    const [state, setState] = useState({
        first_name: "",
        last_name: "",
        city: "",
        primary_email: "",
    });
    const [error, setError] = useState("");
    const [notify, setNotify] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch(`/v1/user/${username}`, {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    const userData = await res.json();
                    setState(userData);
                } else {
                    const err = await res.json();
                    setError(err.error);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUserData();
    }, [username]);

    const onChange = (ev) => {
        setError("");
        setState({
            ...state,
            [ev.target.name]: ev.target.value,
        });
    };

    const onSubmit = async (ev) => {
        ev.preventDefault();
        if (error !== "") return;
        try {
            const res = await fetch("/v1/user", {
                method: "PUT",
                body: JSON.stringify(state),
                credentials: "include",
                headers: {
                    "content-type": "application/json",
                },
            });
            if (res.ok) {
                setNotify(`Profile updated successfully.`);
            } else {
                const err = await res.json();
                setError(err.error);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const onAcceptNotification = () => {
        setNotify("");
        navigate(`/profile/${username}`);
    };

    return (
        <div style={{ gridArea: "main" }}>
            {notify !== "" ? (
                <ModalNotify id="notification" msg={notify} onAccept={onAcceptNotification} />
            ) : null}
            <ErrorMessage msg={error} />
            <FormBase onSubmit={onSubmit}>
                <FormLabel htmlFor="first_name">First Name:</FormLabel>
                <FormInput
                    id="first_name"
                    name="first_name"
                    placeholder="First Name"
                    onChange={onChange}
                    value={state.first_name}
                />
                <FormLabel htmlFor="last_name">Last Name:</FormLabel>
                <FormInput
                    id="last_name"
                    name="last_name"
                    placeholder="Last Name"
                    onChange={onChange}
                    value={state.last_name}
                />
                <FormLabel htmlFor="city">City:</FormLabel>
                <FormInput
                    id="city"
                    name="city"
                    placeholder="City"
                    onChange={onChange}
                    value={state.city}
                />
                <FormLabel htmlFor="primary_email">Email:</FormLabel>
                <FormInput
                    id="primary_email"
                    name="primary_email"
                    type="email"
                    placeholder="Email Address"
                    onChange={onChange}
                    value={state.primary_email}
                />
                <FormButton id="submitBtn" type="submit">
                    Save Changes
                </FormButton>
            </FormBase>
        </div>
    );
};
