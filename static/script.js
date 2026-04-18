document.addEventListener('DOMContentLoaded', () => {
    // --- UI Logic ---

    // Tabs switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Toast Notification
    function showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toast-message');
        
        msgEl.textContent = message;
        toast.style.borderLeft = `4px solid ${isError ? 'var(--accent-2)' : 'var(--success)'}`;
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // --- API Interactions ---

    const fetchBooks = async (query = '') => {
        try {
            const response = await fetch(`/api/books?q=${encodeURIComponent(query)}`);
            const books = await response.json();
            renderTable(books);
        } catch (error) {
            console.error('Failed to fetch books', error);
            showToast('Failed to connect to server', true);
        }
    };

    const renderTable = (books) => {
        const tbody = document.getElementById('books-body');
        tbody.innerHTML = '';

        if (Object.keys(books).length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No books found.</td></tr>`;
            return;
        }

        for (const [id, book] of Object.entries(books)) {
            const tr = document.createElement('tr');
            
            const statusClass = book.available ? 'status-available' : 'status-issued';
            const statusText = book.available ? 'Available' : 'Issued';

            tr.innerHTML = `
                <td>${id}</td>
                <td><strong>${book.title}</strong></td>
                <td>${book.author}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            `;
            tbody.appendChild(tr);
        }
    };

    // Submissions
    document.getElementById('add-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('add-id').value.trim(),
            title: document.getElementById('add-title').value.trim(),
            author: document.getElementById('add-author').value.trim()
        };

        const res = await fetch('/api/books', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        
        showToast(result.message, !result.success);
        if (result.success) {
            document.getElementById('add-form').reset();
            fetchBooks();
        }
    });

    document.getElementById('issue-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('issue-id').value.trim(),
            member: document.getElementById('issue-member').value.trim()
        };

        const res = await fetch('/api/issue', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        
        showToast(result.message, !result.success);
        if (result.success) {
            document.getElementById('issue-form').reset();
            fetchBooks();
        }
    });

    document.getElementById('return-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('return-id').value.trim()
        };

        const res = await fetch('/api/return', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        
        showToast(result.message, !result.success);
        if (result.success) {
            document.getElementById('return-form').reset();
            fetchBooks();
        }
    });

    // Live Search
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        fetchBooks(e.target.value.trim());
    });

    // Init
    fetchBooks();
});
