"use client";

import { useEffect } from "react";

export default function DocsRedirect() {
	useEffect(() => {
		window.location.replace("http://localhost:3002/docs");
	}, []);

	return null;
}
