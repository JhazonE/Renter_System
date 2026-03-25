(async () => {
    try {
        const res = await fetch('http://localhost:5000/api/registrations/1/meal-ticket-expiration', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'x-user-role': 'Admin' },
            body: JSON.stringify({
                expirationDate: '2026-03-31'
            })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", data);
    } catch(err) {
        console.error("Error:", err.message);
    }
})();
