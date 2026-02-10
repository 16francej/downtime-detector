export interface Outage {
  id: string;
  service: string;
  date: string;
  description: string;
  duration: string;
  timestamp: number;
}

export const outages: Outage[] = [
  {
    id: "aws-s3-2017",
    service: "AWS",
    date: "February 28, 2017",
    description: "AWS S3 outage in US-EAST-1 region caused widespread internet disruption",
    duration: "4 hours",
    timestamp: new Date("2017-02-28").getTime(),
  },
  {
    id: "cloudflare-2019",
    service: "Cloudflare",
    date: "July 2, 2019",
    description: "Cloudflare outage affected millions of websites worldwide due to a bad WAF rule",
    duration: "27 minutes",
    timestamp: new Date("2019-07-02").getTime(),
  },
  {
    id: "facebook-2021",
    service: "Facebook",
    date: "October 4, 2021",
    description: "Facebook, Instagram, and WhatsApp went down globally due to BGP routing issues",
    duration: "6 hours",
    timestamp: new Date("2021-10-04").getTime(),
  },
  {
    id: "github-2018",
    service: "GitHub",
    date: "October 21, 2018",
    description: "GitHub experienced a major service disruption affecting git operations and web UI",
    duration: "24 hours",
    timestamp: new Date("2018-10-21").getTime(),
  },
  {
    id: "aws-ec2-2011",
    service: "AWS",
    date: "April 21, 2011",
    description: "AWS EC2 outage in US-EAST-1 took down Reddit, Quora, and many other sites",
    duration: "3 days",
    timestamp: new Date("2011-04-21").getTime(),
  },
  {
    id: "google-2020",
    service: "Google",
    date: "December 14, 2020",
    description: "Google services including Gmail, YouTube, and Drive went down globally",
    duration: "1 hour",
    timestamp: new Date("2020-12-14").getTime(),
  },
  {
    id: "fastly-2021",
    service: "Fastly",
    date: "June 8, 2021",
    description: "Fastly CDN outage took down major websites including Amazon, Reddit, and NYTimes",
    duration: "1 hour",
    timestamp: new Date("2021-06-08").getTime(),
  },
];
