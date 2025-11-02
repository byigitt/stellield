"use client";

import { useEffect } from "react";

export default function DocsRedirect() {
	useEffect(() => {
		window.location.replace("https://docs.stellield.baris.world");
	}, []);

	return null;
}
