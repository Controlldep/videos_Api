import express, { Express } from "express";
import { Request, Response } from "express";

export const setupApp = (app: Express) => {
    app.use(express.json());

    enum Resolution {
        P144 = "P144",
        P240 = "P240",
        P360 = "P360",
        P480 = "P480",
        P720 = "P720",
        P1080 = "P1080",
        P1440 = "P1440",
        P2160 = "P2160"
    }
    type Video = {
        id: number;
        title: string;
        author: string;
        canBeDownloaded: boolean;
        minAgeRestriction: number | null;
        createdAt: string;
        publicationDate: string;
        availableResolutions: Resolution[];
    };

    let videos: Video[] = []

    app.get('/api/videos', (req: Request  , res: Response ) => {
        res.status(200).json(videos)
    })

    app.post('/api/videos',(req: Request  , res: Response) => {
        const {title , author , availableResolutions} = req.body
        const isValid = Array.isArray(availableResolutions) &&
            availableResolutions.every(r => Object.values(Resolution).includes(r));
        if(!title || !author || !isValid || author.length > 20 || title.length > 40) {
            return res.status(400).send({
                errorsMessages: [
                    {message: "Invalid input", field: !title ? "title" : !author ? "author" : "availableResolutions"}
                ]
            })
        }
        const createVideo = {
            "id": +Date.now(),
            title ,
            author ,
            "canBeDownloaded": false,
            "minAgeRestriction": null,
            "createdAt": new Date().toISOString(),
            "publicationDate": new Date().toISOString(),
            availableResolutions
        }
        videos.push(createVideo)
        res.status(201).json(createVideo)
    })

    app.get('/api/videos/:id' , (req: Request  , res: Response) => {
        const id = Number(req.params.id)
        const findVideos = videos.find(value => value.id === id)
        if(findVideos) {
            return res.status(200).json(findVideos)
        }else {
            return res.status(404)
        }
    })

    app.put('/api/videos/:id', (req: Request  , res: Response) => {
        const id = Number(req.params.id);
        const video = videos.find(v => v.id === id);
        if (!video) return res.status(404);

        const { title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate } = req.body;

        const isResolutionsValid = Array.isArray(availableResolutions) &&
            availableResolutions.every(r => Object.values(Resolution).includes(r as Resolution));

        const errors = [];
        if (!title || typeof title !== "string" || title.length > 40) errors.push({ message: "Invalid title", field: "title" });
        if (!author || typeof author !== "string" || author.length > 20) errors.push({ message: "Invalid author", field: "author" });
        if (!isResolutionsValid) errors.push({ message: "Invalid availableResolutions", field: "availableResolutions" });
        if (typeof canBeDownloaded !== "boolean") errors.push({ message: "Invalid canBeDownloaded", field: "canBeDownloaded" });
        if (minAgeRestriction !== null && typeof minAgeRestriction !== "number") errors.push({ message: "Invalid minAgeRestriction", field: "minAgeRestriction" });
        if (!publicationDate || isNaN(Date.parse(publicationDate))) errors.push({ message: "Invalid publicationDate", field: "publicationDate" });

        if (errors.length > 0) return res.status(400).json({ errorsMessages: errors });

        Object.assign(video, { title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate });

        return res.status(204);
    });

    app.delete('/api/videos/:id' , (req: Request  , res: Response) => {
        const id = Number(req.params.id);
        const video = videos.findIndex(v => v.id === id);
        if (video === -1) {
            return res.status(404);
        }else {
            videos.splice(video , 1);
            return  res.status(204)
        }
    })

    app.delete('/api/testing/all-data' , (req: Request  , res: Response) => {
        videos = [];
        res.status(204)
    })
    return app;
};