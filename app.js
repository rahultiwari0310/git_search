const form = document.getElementById("search-repo")
let allRepos = []
let selectedLanguage = ''
let selectedSort = ''
const sortOptions = [
    {
        label: 'Last updated',
        value: 'updated_at'
    },
    {
        label: 'Stars count',
        value: 'stargazers_count'
    }
]

form.addEventListener("submit", e => {
    e.preventDefault()

    const username = e.target.elements['repo-input'].value

    fetch(`https://api.github.com/users/${username}/repos`)
        .then(resp => resp.json())
        .then(resp => {
            resp = resp.map(it => {
                return {
                    ...it,
                    updated_at: new Date(it.updated_at).getTime()
                }
            })
            allRepos = resp
            addFilters()
            showResults()
        })
        .catch(err => {
            console.log(err)
        })


})

function addFilters() {
    const languageContainer = document.getElementById('language')
    const sortContainer = document.getElementById('sort')

    const languageSelect = getSelectTag('language', 'language', getUniqLanguages(allRepos), handleFilterChange)
    const sortSelect = getSelectTag('sort', 'sort', sortOptions, handleFilterChange)

    if (languageContainer.childNodes[0] && sortContainer.childNodes[0]) {
        languageContainer.replaceChild(languageSelect, languageContainer.childNodes[0])
        sortContainer.replaceChild(sortSelect, sortContainer.childNodes[0])
    } else {
        languageContainer.appendChild(languageSelect, handleFilterChange)
        sortContainer.appendChild(sortSelect)
    }

}

//Get uniq list of languages from the returned repos
function getUniqLanguages(repos) {
    return [...new Set(repos.map(it => it.language))].filter(Boolean).map(it => {
        return {
            label: it,
            value: it
        }
    })
}


//Handle sort or language filter value change
function handleFilterChange(e) {
    if (e.target.name === 'language') {
        selectedLanguage = e.target.value
    } else {
        selectedSort = e.target.value
    }

    showResults()

}

//Will return select tag
function getSelectTag(id, name, options) {
    const select = document.createElement('select')
    select.id = id
    select.name = name
    let optionsElem = [
        `<option value="">${name}</option>`
    ]
    select.addEventListener('change', handleFilterChange)
    optionsElem = optionsElem.concat(options.map(it => {
        return `<option value="${it.value}">${it.label}</option>`
    })).join('')
    select.innerHTML = optionsElem
    return select
}

//Will update repo list based on selected filter and sorting
function showResults() {
    let repos = selectedLanguage ? allRepos.filter(it => it.language === selectedLanguage) : allRepos
    repos = selectedSort ? repos.sort((a, b) => b[selectedSort] - a[selectedSort]) : repos

    const repoList = repos.map(it => getRepoItem(it)).join('')
    const results = `<ul>
        ${repoList}
    </ul>`
    document.getElementById("results-container").innerHTML = results
}

//will return one repo item of list
function getRepoItem({ name, html_url, updated_at, stargazers_count, description, language }) {
    return `<li>
        ${getAnchorTag(html_url, name)}
        ${getParagraph(description)}
        <div class="repo-foot">
            ${getLanguage(language)}
            ${getStars(stargazers_count)}
            ${getLastUpdated(updated_at)}
        </div>
    </li>`
}

//Repo item elements
function getAnchorTag(url, name) {
    if (url && name) {
        return `<a class="repo-link" href="${url}" target="_blank">${name}</a>`
    }
    return ''

}
function getParagraph(caption) {
    if (caption) {
        return `<p class="repo-desc">${caption}</p>`
    }
    return ''
}
function getLanguage(language) {
    if (language) {
        return `<i class="language-bullet">&#x2022;</i><span class="repo-lang">${language}</span>`
    }
    return ''
}

function getStars(stars) {
    return `<i class="star-icon">&#10034;</i><span class="repo-stars">${stars || 0}</span>`
}

function getLastUpdated(date) {
    return `<span class="repo-updated">Updated: ${new Date(date).toLocaleString()}</span>`
}