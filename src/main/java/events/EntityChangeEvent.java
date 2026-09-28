package events;

public record EntityChangeEvent(
        String entity,
        String action,
        long id
) {
    public static final String FLAT = "flat";
    public static final String COORDINATES = "coordinates";
    public static final String HOUSE = "house";

    public static final String CREATED = "created";
    public static final String UPDATED = "updated";
    public static final String DELETED = "deleted";
}
