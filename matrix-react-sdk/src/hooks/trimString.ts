export const trimString = (str: string) => {
    if(str.length >= 32) {
        str = str.substr(0, 5) + '...' + str.substr(str.length - 5, str.length);
        str = str.toUpperCase();
    }
    return str;
}

export const trimUserId = (str: string) => {
    let nameSection = '';
    let newString = '';
    for(let i = 0; i < str?.length; i++) {
        if(str.charAt(i) === "@") continue
        if(str.charAt(i) === ":") break;
        nameSection += str.charAt(i);
    }
    if(nameSection?.length >= 32) {
        newString = nameSection.substr(0, 5) + '...' + nameSection.substr(nameSection.length - 5, nameSection.length);
        console.log("nameSection", str, nameSection, newString)
        str = str.replace(nameSection, newString);
    }
    return str;
}

export const checkTokenDomainName = (str: string) => {
    let index = str.indexOf("᎐sol");
    let index1 = str.indexOf(".eth");
    if(index !== -1 || index1 !== -1) return true;
    return false
}

export const trimSolTokenAmount = (amount: number) => {
    amount = Math.round(amount * 10000) / 10000;
    return amount
}

export const trimCreditsAmount = (amount: number) => {
    if(amount >= 1000) {
        amount = Math.round(amount / 10) / 100;
        return `${amount}K`
    }
    else return `${amount}`
}