"use client";

import { useEffect } from "react";

export default function DocsRedirect() {
	useEffect(() => {
		window.location.replace(process.env.NODE_ENV === "production" ? "https://docs.stellield.baris.world" : "http://localhost:3002/docs");
	}, []);

	return null;
}
