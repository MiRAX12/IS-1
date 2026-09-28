package entity;

import java.time.LocalDateTime;
import java.util.Objects;

public class Flat {

    private int id; //Значение поля должно быть больше 0, Значение этого поля должно быть уникальным, Значение этого поля должно генерироваться автоматически

    private String name; //Поле не может быть null, Строка не может быть пустой

    private Coordinates coordinates; //Поле не может быть null

    private LocalDateTime creationDate; //Поле не может быть null, Значение этого поля должно генерироваться автоматически

    private Float area; //Максимальное значение поля: 628, Значение поля должно быть больше 0

    private Long price; //Значение поля должно быть больше 0

    private Boolean balcony; //Поле может быть null

    private Long timeToMetroOnFoot; //Значение поля должно быть больше 0

    private int numberOfRooms; //Значение поля должно быть больше 0

    private int floor; //Значение поля должно быть больше 0

    private Furnish furnish; //Поле не может быть null

    private View view; //Поле может быть null

    private House house; //Поле не может быть null

    public Flat() {
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Coordinates getCoordinates() { return coordinates; }
    public void setCoordinates(Coordinates coordinates) { this.coordinates = coordinates; }

    public LocalDateTime getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDateTime creationDate) { this.creationDate = creationDate; }

    public Float getArea() { return area; }
    public void setArea(Float area) { this.area = area; }

    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }

    public Boolean getBalcony() { return balcony; }
    public void setBalcony(Boolean balcony) { this.balcony = balcony; }

    public Long getTimeToMetroOnFoot() { return timeToMetroOnFoot; }
    public void setTimeToMetroOnFoot(Long timeToMetroOnFoot) { this.timeToMetroOnFoot = timeToMetroOnFoot; }

    public int getNumberOfRooms() { return numberOfRooms; }
    public void setNumberOfRooms(int numberOfRooms) { this.numberOfRooms = numberOfRooms; }

    public int getFloor() { return floor; }
    public void setFloor(int floor) { this.floor = floor; }

    public Furnish getFurnish() { return furnish; }
    public void setFurnish(Furnish furnish) { this.furnish = furnish; }

    public View getView() { return view; }
    public void setView(View view) { this.view = view; }

    public House getHouse() { return house; }
    public void setHouse(House house) { this.house = house; }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Flat flat = (Flat) o;
        return id == flat.id && numberOfRooms == flat.numberOfRooms && floor == flat.floor && Objects.equals(name, flat.name) && Objects.equals(coordinates, flat.coordinates) && Objects.equals(creationDate, flat.creationDate) && Objects.equals(area, flat.area) && Objects.equals(price, flat.price) && Objects.equals(balcony, flat.balcony) && Objects.equals(timeToMetroOnFoot, flat.timeToMetroOnFoot) && furnish == flat.furnish && view == flat.view && Objects.equals(house, flat.house);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, coordinates, creationDate, area, price, balcony, timeToMetroOnFoot, numberOfRooms, floor, furnish, view, house);
    }

    @Override
    public String toString() {
        return "Flat{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", coordinates=" + coordinates +
                ", creationDate=" + creationDate +
                ", area=" + area +
                ", price=" + price +
                ", balcony=" + balcony +
                ", timeToMetroOnFoot=" + timeToMetroOnFoot +
                ", numberOfRooms=" + numberOfRooms +
                ", floor=" + floor +
                ", furnish=" + furnish +
                ", view=" + view +
                ", house=" + house +
                '}';
    }
}
