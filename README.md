# IPT_LiDAR_Webapp: 3D Evaluation Dashboard

This is a custom web-based 3D Evaluation Dashboard built to visualize and analyze the results of the LiDAR building reconstruction project. The tool is developed using React and the Three.js library to provide synchronized, real-time analysis of 3D spatial data.

## Features
* **Four-Way Comparison:** Synchronized views of Source LiDAR, Ground Truth Mesh, Voxelized Reference, and Model Predictions.
* **Compare Mode:** Side-by-side analysis of different mesh predictions generated via the Marching Cubes algorithm.
* **Interactive Visualization:** Full 3D rotation, zoom, and inspection of 64^3 voxel spaces and polygonal meshes from the Zurich LoD2 dataset.

<img width="2880" height="1470" alt="Screenshot 2026-05-12 085041" src="https://github.com/user-attachments/assets/61a2cfa3-3aed-4e4f-9590-57286b7c909f" />

## Setup Instructions

### 1. Clone the Repository
Clone the project to your local machine:
```bash
git clone [https://github.com/TobiasRobertEeksman/IPT_LiDAR_Webapp](https://github.com/TobiasRobertEeksman/IPT_LiDAR_Webapp)
cd IPT_LiDAR_Webapp
```

### 2. Add the Dataset
The raw dataset is too large to be included in this repository. You must manually add the visualization data to the correct directory.

Download the selected data files from the project Google Drive: Google Drive Folder

Place the downloaded public folder into the root.

### 3. Install and Run
Ensure you have Node.js installed, then run:


```bash
npm install
npm run dev
The application will be accessible at http://localhost:5173.
```

Dashboard Overview
The dashboard facilitates qualitative evaluation that standard metrics cannot capture, allowing for a direct comparison between noisy input and reconstructed outputs.


<img width="2880" height="1452" alt="Screenshot 2026-05-12 085257" src="https://github.com/user-attachments/assets/46588616-0427-4f81-b9ff-561797f71ede" />

