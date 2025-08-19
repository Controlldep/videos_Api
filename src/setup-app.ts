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

    app.get("/", (req, res) => {
        res.send("Hello from Render!");
    });

    app.get('/videos', (req: Request  , res: Response ) => {
        res.sendStatus(200).json(videos)
    })

    app.post('/videos', (req: Request, res: Response) => {
        const { title, author, availableResolutions } = req.body;

        const errorsMessages: { message: string; field: string }[] = [];

        if (!title || typeof title !== 'string' || title.length > 40) {
            errorsMessages.push({ message: 'Invalid input', field: 'title' });
        }

        if (!author || typeof author !== 'string' || author.length > 20) {
            errorsMessages.push({ message: 'Invalid input', field: 'author' });
        }

        if (
            availableResolutions !== undefined &&
            (!Array.isArray(availableResolutions) ||
                !availableResolutions.every(r => Object.values(Resolution).includes(r)))
        ) {
            errorsMessages.push({ message: 'Invalid input', field: 'availableResolutions' });
        }


        if (errorsMessages.length > 0) {
            return res.status(400).json({ errorsMessages });
        }


        const createdAt = new Date().toISOString();
        const publicationDate = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString();

        const createVideo = {
            id: +Date.now(),
            title,
            author,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt,
            publicationDate,
            availableResolutions: availableResolutions || []
        };

        videos.push(createVideo);
        res.status(201).json(createVideo);
    });

    app.get('/videos/:id' , (req: Request  , res: Response) => {
        const id = Number(req.params.id)
        const findVideos = videos.find(value => value.id === id)
        if(findVideos) {
            return res.sendStatus(200).json(findVideos)
        }else {
            return res.sendStatus(404)
        }
    })

    app.put('/videos/:id', (req: Request  , res: Response) => {
        const id = Number(req.params.id);
        const video = videos.find(v => v.id === id);
        if (!video) return res.sendStatus(404);

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

        return res.sendStatus(204);
    });

    app.delete('/videos/:id' , (req: Request  , res: Response) => {
        const id = Number(req.params.id);
        const video = videos.findIndex(v => v.id === id);
        if (video === -1) {
            return res.sendStatus(404);
        }else {
            videos.splice(video , 1);
            return  res.sendStatus(204)
        }
    })

    app.delete('/testing/all-data' , (req: Request  , res: Response) => {
        videos = [];
        res.sendStatus(204)
    })
    return app;
};