document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-button");
    const userNameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.querySelector("#easy-label");
    const mediumLabel = document.querySelector("#medium-label");
    const hardLabel = document.querySelector("#hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        if (!regex.test(username)) {
            alert("Invalid Username");
            return false;
        }
        return true;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;
            statsContainer.classList.add("hidden");

            const proxyUrl = "https://cors-anywhere.herokuapp.com/";
            const targetUrl = "https://leetcode.com/graphql/";

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const graphql = JSON.stringify({
                query: `
                    query getUserProfile($username: String!) {
                        matchedUser(username: $username) {
                            submitStatsGlobal {
                                acSubmissionNum {
                                    difficulty
                                    count
                                }
                            }
                        }
                        allQuestionsCount {
                            difficulty
                            count
                        }
                    }
                `,
                variables: { username: username },
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);

            if (!response.ok) {
                throw new Error("Unable to fetch user details.");
            }

            const parsedData = await response.json();
            displayUserData(parsedData.data);
        } catch (error) {
            console.error("Error fetching user details:", error,"request access using: https://cors-anywhere.herokuapp.com/corsdemo");
            alert("No Data Found");
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(data) {
        // const totalQues = data.allQuestionsCount[0].count;
        const totalEasy = data.allQuestionsCount[1].count;
        const totalMedium = data.allQuestionsCount[2].count;
        const totalHard = data.allQuestionsCount[3].count;

        const solvedEasy = data.matchedUser.submitStatsGlobal.acSubmissionNum[1].count;
        const solvedMedium = data.matchedUser.submitStatsGlobal.acSubmissionNum[2].count;
        const solvedHard = data.matchedUser.submitStatsGlobal.acSubmissionNum[3].count;

        const totalSubmissions = solvedEasy + solvedMedium + solvedHard;

        updateProgress(solvedEasy, totalEasy, easyLabel, easyProgressCircle);
        updateProgress(solvedMedium, totalMedium, mediumLabel, mediumProgressCircle);
        updateProgress(solvedHard, totalHard, hardLabel, hardProgressCircle);

        const cardsData = [
            { label: "Overall Submissions", value: totalSubmissions },
            { label: "Overall Easy Submissions", value: solvedEasy },
            { label: "Overall Medium Submissions", value: solvedMedium },
            { label: "Overall Hard Submissions", value: solvedHard },
        ];
    
        cardStatsContainer.innerHTML = ""; // Clear existing cards
        cardsData.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
            cardElement.innerHTML = `
                <p>${card.label}</p>
                <h3>${card.value}</h3>
            `;
            cardStatsContainer.appendChild(cardElement);
        });
    
        statsContainer.classList.remove("hidden");
    }

    searchButton.addEventListener("click", function () {
        const username = userNameInput.value.trim();
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});
