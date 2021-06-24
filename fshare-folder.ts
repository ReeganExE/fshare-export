import './save';

getFolder(determineCurrentFolder());

function mapSeries<T, R>(
  arr: T[],
  map: (p: T, index: number, arrayLength: number) => R | Promise<R>
): Promise<R[]> {
  if (!Array.isArray(arr)) throw new Error('mapSeries requires an Array');
  const results = new Array<R>(arr.length);

  return arr
    .reduce(
      (chain, item, i, arr) =>
        chain
          .then(() => map(item, i, arr.length))
          .then((val) => {
            results[i] = val;
          }),
      Promise.resolve()
    )
    .then(() => results);
}

function getFolderById(id: string): Promise<{ items: LinkObj[]; dirName: string }> {
  const FSELL = 'https://www.fshare.vn';
  let folderName = '';
  const types: string[] = ['folder', 'file'];
  const folder = id;
  const all: LinkObj[] = [];

  function append(items: LinkObj[]) {
    all.push(
      ...items.map((it) => Object.assign(it, { link: `${FSELL}/${types[it.type]}/${it.linkcode}` }))
    );
  }

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
        const nextLink = l._links.next;
        const curDirName = l.current.name;
        if (!folderName) {
          folderName = l.current.name;
        }
        const fileItems = l.items.filter((f) => types[f.type] === 'file');
        append(fileItems);

        const folderItems = l.items.filter((f) => types[f.type] === 'folder');
        return mapSeries(folderItems, (item) => {
          console.log('Getting subfolder', item.name, item.linkcode);
          return getFolderById(item.linkcode).then((a) => a.items);
        }).then((allDirItems) => {
          allDirItems.forEach(append);
          if (nextLink) {
            console.log(`Getting ${curDirName}`, nextLink);
            return get(nextLink);
          }
        });
      });
  }

  return get().then(() => ({ items: all, dirName: folderName }));
}

function getFolder(id: string, filename?: string) {
  const clean = loading();

  getFolderById(id)
    .then(({ items: all, dirName: folderName }) => {
      console.log(all);
      const csv = all.map((link) => [link.link, link.name, ...sizeOf(link)].join(',')).join('\n');
      console.save(csv, filename || `${folderName}.csv`);
    })
    .finally(clean);
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

function loading(): () => void {
  const ctn = document.createElement('div');
  document.body
    .appendChild(ctn)
    .attachShadow({ mode: 'open' })
    .appendChild(
      Object.assign(document.createElement('div'), {
        textContent: 'Loading ...',
        style: `
      font-weight: bold;
      width: 200px;
      background: #9e9e9e;
      z-index: 321;
      border-radius: 4px;
      padding: 10px;
      text-align: center;
      color: white;
      box-shadow: 0px 0px 3px 1px #585858;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);`,
      })
    );

  return () => {
    ctn.remove();
  };
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
