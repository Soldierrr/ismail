import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        adminContent: resolve(__dirname, 'admin-content.html'),
        adminDashboard: resolve(__dirname, 'admin-dashboard.html'),
        adminPapers: resolve(__dirname, 'admin-papers.html'),
        adminPayments: resolve(__dirname, 'admin-payments.html'),
        adminProfile: resolve(__dirname, 'admin-profile.html'),
        adminTickets: resolve(__dirname, 'admin-tickets.html'),
        adminUpload: resolve(__dirname, 'admin-upload.html'),
        adminUsers: resolve(__dirname, 'admin-users.html'),
        admin: resolve(__dirname, 'admin.html'),
        browse: resolve(__dirname, 'browse.html'),
        contact: resolve(__dirname, 'contact.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        dataset: resolve(__dirname, 'dataset.html'),
        login: resolve(__dirname, 'login.html'),
        upload: resolve(__dirname, 'upload.html')
      }
    }
  }
});
