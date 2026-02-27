let links = []
let clickLogs = []
let milestones = []

function loadData() {
    let savedLinks = localStorage.getItem('oneShotLinks')
    let savedLogs = localStorage.getItem('clickLogs')
    let savedMilestones = localStorage.getItem('milestones')
    
    if (savedLinks) {
        links = JSON.parse(savedLinks)
    }
    if (savedLogs) {
        clickLogs = JSON.parse(savedLogs)
    }
    if (savedMilestones) {
        milestones = JSON.parse(savedMilestones)
    }
    
    displayLinks()
    displayMilestones()
}

function saveData() {
    localStorage.setItem('oneShotLinks', JSON.stringify(links))
    localStorage.setItem('clickLogs', JSON.stringify(clickLogs))
    localStorage.setItem('milestones', JSON.stringify(milestones))
}

function generate7LetterCode() {
    let letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = ''
    for (let i = 0; i < 7; i++) {
        let randomIndex = Math.floor(Math.random() * letters.length)
        result = result + letters[randomIndex]
    }
    return result
}

function createLink() {
    let longUrl = document.getElementById('longUrl').value
    
    if (!longUrl) {
        alert('Please enter a URL')
        return
    }
    
    if (!longUrl.startsWith('http')) {
        longUrl = 'https://' + longUrl
    }
    
    let code = generate7LetterCode()
    
    while (links.find(l => l.code === code)) {
        code = generate7LetterCode()
    }
    
    let now = new Date()
    
    let newLink = {
        code: code,
        longUrl: longUrl,
        createdAt: now.toISOString(),
        clicks: 0,
        isActive: true,
        lastClicked: null
    }
    
    links.push(newLink)
    saveData()
    
    document.getElementById('longUrl').value = ''
    
    let shortUrl = window.location.href.split('?')[0] + '?code=' + code
    
    document.getElementById('result').innerHTML = 
        'Short URL created: <a href="' + shortUrl + '" target="_blank">' + shortUrl + '</a>'
    
    displayLinks()
}

function getDeviceType() {
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    return isMobile ? 'Mobile' : 'Desktop'
}

function clickLink(code) {
    let linkIndex = links.findIndex(l => l.code === code)
    
    if (linkIndex === -1) {
        alert('Link not found')
        return
    }
    
    let link = links[linkIndex]
    
    if (!link.isActive) {
        alert('This one-shot link has already been used')
        return
    }
    
    let deviceType = getDeviceType()
    
    link.clicks = link.clicks + 1
    link.lastClicked = new Date().toISOString()
    
    let log = {
        code: code,
        clickedAt: new Date().toISOString(),
        device: deviceType
    }
    clickLogs.push(log)
    
    if (link.clicks === 1) {
        let milestone = {
            code: code,
            clicks: link.clicks,
            message: 'Link ' + code + ' used for the first time!',
            timestamp: new Date().toISOString()
        }
        milestones.push(milestone)
        console.log('MILESTONE: ' + milestone.message)
        displayMilestones()
    }
    
    links[linkIndex].isActive = false
    
    saveData()
    displayLinks()
    
    window.open(link.longUrl, '_blank')
}

function deleteLink(code) {
    links = links.filter(l => l.code !== code)
    saveData()
    displayLinks()
}

function displayLinks() {
    let html = ''
    
    for (let i = 0; i < links.length; i++) {
        let link = links[i]
        let shortUrl = window.location.href.split('?')[0] + '?code=' + link.code
        
        let status = link.isActive ? '🟢 Active' : '🔴 Used'
        
        html = html + '<div class="link-item">'
        html = html + '<div>'
        html = html + '<strong>' + link.code + '</strong> (7 letters) -> ' + link.longUrl + '<br>'
        html = html + 'Clicks: ' + link.clicks + ' | Status: ' + status + '<br>'
        html = html + '<small>Created: ' + new Date(link.createdAt).toLocaleString() + '</small><br>'
        
        let logsForLink = clickLogs.filter(l => l.code === link.code)
        if (logsForLink.length > 0) {
            html = html + '<small>Last click: ' + logsForLink[logsForLink.length-1].device + ' device</small>'
        }
        
        html = html + '</div>'
        
        if (link.isActive) {
            html = html + '<button onclick="clickLink(\'' + link.code + '\')">Test Click</button>'
        } else {
            html = html + '<button onclick="deleteLink(\'' + link.code + '\')">Delete</button>'
        }
        
        html = html + '</div>'
    }
    
    if (links.length === 0) {
        html = '<p>No links created yet</p>'
    }
    
    document.getElementById('linksList').innerHTML = html
}

function displayMilestones() {
    let html = ''
    
    let recentMilestones = milestones.slice(-5)
    
    for (let i = 0; i < recentMilestones.length; i++) {
        let m = recentMilestones[i]
        html = html + '<div class="milestone">'
        html = html + '🎉 ' + m.message
        html = html + '<br><small>' + new Date(m.timestamp).toLocaleString() + '</small>'
        html = html + '</div>'
    }
    
    if (milestones.length === 0) {
        html = '<p>No milestones yet. Click your links!</p>'
    }
    
    document.getElementById('milestones').innerHTML = html
}

function checkUrlParams() {
    let urlParams = new URLSearchParams(window.location.search)
    let code = urlParams.get('code')
    
    if (code) {
        clickLink(code)
        
        let newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
    }
}

loadData()
checkUrlParams()
