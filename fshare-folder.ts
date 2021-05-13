import './save';

getFolder(determineCurrentFolder());

function getFolder(id: string, filename?: string) {
  const FSELL = 'https://www.fshare.vn';
  let folderName = '';
  const types: string[] = ['folder', 'file'];
  const folder = id;
  const all: LinkObj[] = [];
  let maxPages = 500;
  function get(
    next = `/v3/files/folder?linkcode=${folder}&sort=type%2Cname&per-page=50`
  ): Promise<void> {
    return fetch(`${FSELL}/api${next}`, {
      referrer: `${FSELL}/folder/${folder}`,
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    })
      .then<ListResponse>((a) => a.json())
      .then((l) => {
        if (!folderName) {
          folderName = l.current.name;
        }
        all.push(
          ...l.items.map((it) =>
            Object.assign(it, { link: `${FSELL}/${types[it.type]}/${it.linkcode}` })
          )
        );
        if (maxPages-- === 0) {
          return;
        }
        const nextLink = l._links.next;
        if (nextLink) {
          console.log('Getting', nextLink);
          return get(nextLink);
        }
      });
  }

  get().then(() => {
    console.log(all);
    const csv = all.map((link) => [link.link, link.name, ...sizeOf(link)].join(',')).join('\n');
    console.save(csv, filename || `${folderName}.csv`);
  });
}

function determineCurrentFolder(): string {
  const breadcumbs: LinkObjBase[] = window.angular
    .element(document.querySelector('.download-folder-container'))
    .scope().folder.breadcumbs;

  // Try to get current folder rather than root folder
  if (breadcumbs && breadcumbs.length) {
    return breadcumbs[breadcumbs.length - 1].linkcode;
  }

  return window.location.pathname.split('/folder/')[1];
}

const MB = 2 ** 20;

function sizeOf(link: LinkObj): string[] {
  if (link.beautiSize) {
    return [link.beautiSize, link.beautiSize.split(' ')[0]];
  }
  const size = (link.size / MB).toFixed(2);
  return [`${size} MB`, size];
}

declare global {
  interface Window {
    angular: any;
  }
}

interface ListResponse {
  items: LinkObj[];
  _links: Links;
  current: LinkObj;
}

interface Links {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

interface LinkObjBase {
  linkcode: string;
  name: string;
}

interface LinkObj extends LinkObjBase {
  id: string;
  link: string;
  beautiSize: string;
  secure: number;
  public: number;
  copied: number;
  shared: number;
  directlink: number;
  type: number;
  path: string;
  hash_index: string;
  owner_id: number;
  pid: number | null;
  size: number;
  mimetype: null | string;
  downloadcount: number;
  description: string;
  created: number;
  lastdownload: number;
  pwd: number;
  modified: number;
  follow: number;
  canFollow: number;
}
